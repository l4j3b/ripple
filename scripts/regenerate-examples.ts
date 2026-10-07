/**
 * Regenerate landing-page example videos with the current script prompt.
 *
 * Usage: npx tsx --env-file=.env.local scripts/regenerate-examples.ts
 */
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import ffmpegPath from "ffmpeg-static";

import type { Explainer, ExplainerUIMessage } from "#/lib/explainer";
import { generateExplainer } from "#/server/generate-explainer";
import { generateVideo } from "#/server/generate-video";

const run = promisify(execFile);
const OUT_DIR = join(process.cwd(), "public", "examples");
const CACHE = "v=3";

const EXAMPLES = [
	{
		id: "example-fed",
		slug: "fed",
		label: "Fed raises rates a quarter point",
		prompt: "Fed raises rates a quarter point in first move of Warsh era",
	},
	{
		id: "example-retail",
		slug: "retail",
		label: "Retail sales surge the most since March",
		prompt:
			"Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
	},
	{
		id: "example-eu-canada",
		slug: "eu-canada",
		label: "EU floats associate membership for Canada",
		prompt:
			"EU chief floats associate membership for Canada after U.S. trade attacks",
	},
	{
		id: "example-ai-pause",
		slug: "ai-pause",
		label: "Why companies won't pause on AI (WSJ)",
		prompt:
			"https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
	},
] as const;

async function download(url: string, path: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Download failed (${response.status}): ${url}`);
	}
	await writeFile(path, Buffer.from(await response.arrayBuffer()));
}

async function extractPoster(videoPath: string, posterPath: string) {
	if (!ffmpegPath) throw new Error("ffmpeg-static is not available.");
	await run(ffmpegPath, [
		"-y",
		"-hide_banner",
		"-loglevel",
		"error",
		"-ss",
		"1",
		"-i",
		videoPath,
		"-frames:v",
		"1",
		"-q:v",
		"3",
		posterPath,
	]);
}

function userMessage(prompt: string): ExplainerUIMessage {
	return {
		id: crypto.randomUUID(),
		role: "user",
		parts: [{ type: "text", text: prompt }],
	};
}

function renderLandingExamples(
	results: Array<{
		id: string;
		slug: string;
		label: string;
		prompt: string;
		plan: Explainer;
	}>,
) {
	const blocks = results.map(({ id, slug, label, prompt, plan }) => {
		const planLiteral = JSON.stringify(plan, null, "\t")
			.split("\n")
			.map((line, index) => (index === 0 ? line : `\t\t${line}`))
			.join("\n");
		return `\t{
\t\tlabel: ${JSON.stringify(label)},
\t\tprompt: ${JSON.stringify(prompt)},
\t\tposter: "/examples/${slug}.jpg?${CACHE}",
\t\tinvocation: example(${JSON.stringify(id)}, "/examples/${slug}.mp4?${CACHE}", ${planLiteral}),
\t}`;
	});

	return `import type { Explainer, ExplainerVideoInvocation } from "#/lib/explainer";

function example(
\tid: string,
\tvideoUrl: string,
\tinput: Explainer,
): ExplainerVideoInvocation {
\treturn {
\t\ttoolCallId: id,
\t\tstate: "output-available",
\t\tinput,
\t\toutput: { videoUrl },
\t};
}

export type LandingExample = {
\tlabel: string;
\tprompt: string;
\tposter: string;
\tinvocation: ExplainerVideoInvocation;
};

export const LANDING_EXAMPLES: LandingExample[] = [
${blocks.join(",\n")}
];
`;
}

async function main() {
	if (!process.env.FAL_KEY) {
		throw new Error("FAL_KEY is not set. Run with --env-file=.env.local");
	}
	await mkdir(OUT_DIR, { recursive: true });

	const results: Array<{
		id: string;
		slug: string;
		label: string;
		prompt: string;
		plan: Explainer;
	}> = [];

	for (const example of EXAMPLES) {
		console.log(`\n=== ${example.slug}: writing script ===`);
		const { sources: _sources, ...plan } = await generateExplainer([
			userMessage(example.prompt),
		]);
		console.log(`=== ${example.slug}: generating video ===`);
		const videoUrl = await generateVideo(plan);
		const videoPath = join(OUT_DIR, `${example.slug}.mp4`);
		const posterPath = join(OUT_DIR, `${example.slug}.jpg`);
		console.log(`=== ${example.slug}: saving ${videoPath} ===`);
		await download(videoUrl, videoPath);
		await extractPoster(videoPath, posterPath);
		results.push({ ...example, plan });
	}

	const landingPath = join(process.cwd(), "src/lib/landing-examples.ts");
	await writeFile(landingPath, renderLandingExamples(results));
	console.log(`\nUpdated ${landingPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
