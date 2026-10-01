import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fal } from "@fal-ai/client";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);

async function download(url: string, path: string) {
	const response = await fetch(url);
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
		await concat(listPath, outputPath);

		const file = new File([await readFile(outputPath)], "explainer.mp4", {
			type: "video/mp4",
		});
		return await fal.storage.upload(file);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}
