import { lookup } from "node:dns/promises";
import { BlockList } from "node:net";

import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";

const MAX_URLS = 3;
const MAX_REDIRECTS = 5;
const MAX_BYTES = 2_000_000;
const MAX_CHARS = 12_000;
const MIN_CHARS = 180;
const TIMEOUT_MS = 15_000;

const BROWSER_UA =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"']+/gi;

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");

type Article = {
	url: string;
	title?: string;
	siteName?: string;
	published?: string;
	text: string;
};

function cleanUrl(raw: string) {
	let url = raw;
	while (/[.,;:!?]$/.test(url)) url = url.slice(0, -1);
	if (url.endsWith(")") && !url.includes("(")) url = url.slice(0, -1);
	return url;
}

function extractUrls(text: string) {
	const seen = new Set<string>();
	for (const match of text.match(URL_PATTERN) ?? []) {
		const url = cleanUrl(match);
		if (!seen.has(url)) seen.add(url);
	}
	return [...seen];
}

function isBlockedAddress(address: string, family: 4 | 6) {
	return blocked.check(address, family === 6 ? "ipv6" : "ipv4");
}

async function assertPublicHttpUrl(raw: string) {
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("That is not a valid URL.");
	}
	if (url.username || url.password) {
		throw new Error("URLs with credentials are not retrieved.");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("Only http and https links can be retrieved.");
	}
	const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
	if (
		hostname === "localhost" ||
		hostname.endsWith(".localhost") ||
		hostname.endsWith(".local") ||
		hostname === "metadata.google.internal"
	) {
		throw new Error("That address cannot be retrieved.");
	}

	const records = await lookup(hostname, { all: true, verbatim: true });
	if (records.length === 0) {
		throw new Error("Could not resolve the host.");
	}
	for (const record of records) {
		const family = record.family === 6 ? 6 : 4;
		if (isBlockedAddress(record.address, family)) {
			throw new Error("That address cannot be retrieved.");
		}
	}
	return url;
}

async function readLimited(response: Response) {
	const reader = response.body?.getReader();
	if (!reader) return "";
	const chunks: Uint8Array[] = [];
	let total = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;
		total += value.byteLength;
		if (total > MAX_BYTES) {
			await reader.cancel();
			throw new Error("The page is too large to retrieve.");
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(bytes);
}

async function fetchHtml(start: string) {
	let current = start;
	for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
		await assertPublicHttpUrl(current);
		const response = await fetch(current, {
			redirect: "manual",
			signal: AbortSignal.timeout(TIMEOUT_MS),
			headers: {
				Accept: "text/html,application/xhtml+xml",
				"Accept-Language": "en-US,en;q=0.9",
				"User-Agent": BROWSER_UA,
			},
		});
		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get("location");
			await response.body?.cancel();
			if (!location) {
				throw new Error(`Redirect had no destination (${response.status}).`);
			}
			if (hop === MAX_REDIRECTS) {
				throw new Error("The link redirected too many times.");
			}
			current = new URL(location, current).href;
			continue;
		}
		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(`The site responded with ${response.status}.`);
		}
		const type = response.headers.get("content-type") ?? "";
		if (type && !/text\/html|application\/xhtml\+xml/i.test(type)) {
			await response.body?.cancel();
			throw new Error("The link is not an HTML page.");
		}
		const html = await readLimited(response);
		return { finalUrl: current, html };
	}
	throw new Error("The link redirected too many times.");
}

function longestArticleBody(document: Document) {
	let best: { title?: string; published?: string; text: string } | null = null;
	for (const script of document.querySelectorAll(
		'script[type="application/ld+json"]',
	)) {
		let data: unknown;
		try {
			data = JSON.parse(script.textContent ?? "");
		} catch {
			continue;
		}
		const stack = [data];
		while (stack.length > 0) {
			const node = stack.pop();
			if (!node || typeof node !== "object") continue;
			if (Array.isArray(node)) {
				stack.push(...node);
				continue;
			}
			const record = node as Record<string, unknown>;
			if (record["@graph"]) stack.push(record["@graph"]);
			const body = record.articleBody;
			if (typeof body !== "string") continue;
			const text = body.replace(/\u00a0/g, " ").trim();
			if (!best || text.length > best.text.length) {
				best = {
					title:
						typeof record.headline === "string" ? record.headline : undefined,
					published:
						typeof record.datePublished === "string"
							? record.datePublished
							: undefined,
					text,
				};
			}
		}
	}
	return best;
}

function readableText(document: Document) {
	const article = new Readability(document).parse();
	const text = article?.textContent?.replace(/\u00a0/g, " ").trim();
	return {
		title: article?.title?.trim() || undefined,
		siteName: article?.siteName?.trim() || undefined,
		published: article?.publishedTime?.trim() || undefined,
		text,
	};
}

function chooseText(fromJsonLd?: string, fromReader?: string) {
	const structured = fromJsonLd?.trim() ?? "";
	const readable = fromReader?.trim() ?? "";
	if (structured && readable) {
		return structured.length >= readable.length * 0.8 ? structured : readable;
	}
	return structured || readable;
}

async function fetchArticle(rawUrl: string): Promise<Article> {
	const { finalUrl, html } = await fetchHtml(rawUrl);
	const virtualConsole = new VirtualConsole();
	virtualConsole.on("error", () => {});
	const dom = new JSDOM(html, { url: finalUrl, virtualConsole });
	const document = dom.window.document;
	const structured = longestArticleBody(document);
	const readable = readableText(document);
	const text = chooseText(structured?.text, readable.text);
	if (text.length < MIN_CHARS) {
		throw new Error("The page did not include a readable article.");
	}
	const clipped =
		text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}\n[truncated]` : text;
	return {
		url: finalUrl,
		title: structured?.title || readable.title,
		siteName: readable.siteName,
		published: structured?.published || readable.published,
		text: clipped,
	};
}

function formatArticle(article: Article) {
	return [
		"Retrieved article",
		`URL: ${article.url}`,
		article.title ? `Title: ${article.title}` : null,
		article.siteName ? `Site: ${article.siteName}` : null,
		article.published ? `Published: ${article.published}` : null,
		"",
		article.text,
	]
		.filter((line) => line !== null)
		.join("\n");
}

async function retrieveOne(url: string) {
	try {
		return formatArticle(await fetchArticle(url));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Could not retrieve this page.";
		const safe =
			message.length > 180 ? "Could not retrieve this page." : message;
		return `Could not retrieve ${url}: ${safe}`;
	}
}

export async function retrieveLinkedArticles(text: string) {
	const urls = extractUrls(text).slice(0, MAX_URLS);
	if (urls.length === 0) return "";
	const blocks = await Promise.all(urls.map(retrieveOne));
	return blocks.join("\n\n");
}
