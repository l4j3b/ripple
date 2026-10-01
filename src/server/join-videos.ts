import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fal } from "@fal-ai/client";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);

const AUDIO_FADE_SECONDS = 0.15;

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

async function concatWithAudioFades(
	listPath: string,
	scenePaths: string[],
	clips: ClipInfo[],
	outputPath: string,
) {
	if (!ffmpegPath) throw new Error("ffmpeg is not available on this platform.");
	const fade = AUDIO_FADE_SECONDS;
	const filters = clips.map(({ seconds = 0 }, index) => {
		const fadeOutStart = Math.max(0, seconds - fade).toFixed(3);
		return `[${index + 1}:a]apad,atrim=end=${seconds.toFixed(3)},afade=t=in:d=${fade},afade=t=out:st=${fadeOutStart}:d=${fade}[a${index}]`;
	});
	const labels = clips.map((_, index) => `[a${index}]`).join("");
	await run(ffmpegPath, [
		"-y",
		"-hide_banner",
		"-loglevel",
		"error",
		"-f",
		"concat",
		"-safe",
		"0",
		"-i",
		listPath,
		...scenePaths.flatMap((path) => ["-i", path]),
		"-filter_complex",
		`${filters.join(";")};${labels}concat=n=${clips.length}:v=0:a=1[a]`,
		"-map",
		"0:v",
		"-map",
		"[a]",
		"-c:v",
		"copy",
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
			await concatWithAudioFades(listPath, scenePaths, clips, outputPath);
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
