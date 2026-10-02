import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fal } from "@fal-ai/client";
import ffmpegPath from "ffmpeg-static";

import { SCENE_PAD_SECONDS } from "#/lib/explainer";

const run = promisify(execFile);

const AUDIO_FADE_SECONDS = 0.15;
const AUDIO_FADE_IN_SECONDS = 0.04;

type ClipInfo = { seconds?: number; hasAudio: boolean };

async function probe(path: string): Promise<ClipInfo> {
	if (!ffmpegPath) return { hasAudio: false };
	let stderr = "";
	try {
		await run(ffmpegPath, ["-hide_banner", "-i", path]);
	} catch (error) {
		stderr = String((error as { stderr?: string }).stderr ?? "");
	}
	const match = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
	const seconds = match
		? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
		: undefined;
	return { seconds, hasAudio: /Stream #\S+.*Audio:/.test(stderr) };
}

async function concatWithPadding(
	scenePaths: string[],
	clips: ClipInfo[],
	outputPath: string,
) {
	if (!ffmpegPath) throw new Error("ffmpeg is not available on this platform.");
	const fadeOut = AUDIO_FADE_SECONDS.toFixed(3);
	const fadeIn = AUDIO_FADE_IN_SECONDS.toFixed(3);
	const chains = clips.map(({ seconds = 0 }, index) => {
		const pad = SCENE_PAD_SECONDS;
		const end = (seconds + pad).toFixed(3);
		const fadeOutStart = Math.max(0, seconds).toFixed(3);
		return [
			`[${index}:v]tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)},format=yuv420p,setpts=PTS-STARTPTS[v${index}]`,
			`[${index}:a]atrim=end=${end},apad=whole_dur=${end},afade=t=in:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}[a${index}]`,
		].join(";");
	});
	const labels = clips.map((_, index) => `[v${index}][a${index}]`).join("");
	await run(ffmpegPath, [
		"-y",
		"-hide_banner",
		"-loglevel",
		"error",
		...scenePaths.flatMap((path) => ["-i", path]),
		"-filter_complex",
		`${chains.join(";")};${labels}concat=n=${clips.length}:v=1:a=1[v][a]`,
		"-map",
		"[v]",
		"-map",
		"[a]",
		"-c:v",
		"libx264",
		"-preset",
		"veryfast",
		"-crf",
		"20",
		"-c:a",
		"aac",
		"-movflags",
		"+faststart",
		outputPath,
	]);
}

async function download(url: string, path: string) {
	const response = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0" },
	});
	if (!response.ok) {
		throw new Error(`Could not download a scene (HTTP ${response.status}).`);
	}
	await writeFile(path, Buffer.from(await response.arrayBuffer()));
}

async function concat(listPath: string, outputPath: string) {
	if (!ffmpegPath) throw new Error("ffmpeg is not available on this platform.");
	const base = ["-y", "-hide_banner", "-loglevel", "error"];
	const input = ["-f", "concat", "-safe", "0", "-i", listPath];
	try {
		// Every scene comes from the same model and settings, so a stream copy
		// is usually valid and avoids re-encoding.
		await run(ffmpegPath, [
			...base,
			...input,
			"-c",
			"copy",
			"-movflags",
			"+faststart",
			outputPath,
		]);
	} catch {
		await run(ffmpegPath, [
			...base,
			...input,
			"-c:v",
			"libx264",
			"-preset",
			"veryfast",
			"-crf",
			"20",
			"-c:a",
			"aac",
			"-movflags",
			"+faststart",
			outputPath,
		]);
	}
}

export async function joinVideos(videoUrls: string[]): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), "ripple-"));
	try {
		const scenePaths = videoUrls.map((_, index) =>
			join(dir, `scene-${index}.mp4`),
		);
		await Promise.all(
			videoUrls.map((url, index) => download(url, scenePaths[index])),
		);

		const listPath = join(dir, "scenes.txt");
		await writeFile(
			listPath,
			scenePaths.map((path) => `file '${path}'`).join("\n"),
		);

		const outputPath = join(dir, "explainer.mp4");
		const clips = await Promise.all(scenePaths.map(probe));
		const canFade = clips.every((clip) => clip.hasAudio && clip.seconds);
		try {
			if (!canFade) throw new Error("Missing clip audio or duration.");
			await concatWithPadding(scenePaths, clips, outputPath);
		} catch {
			await concat(listPath, outputPath);
		}

		const file = new File([await readFile(outputPath)], "explainer.mp4", {
			type: "video/mp4",
		});
		return await fal.storage.upload(file);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}
