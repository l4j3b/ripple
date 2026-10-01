import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fal } from "@fal-ai/client";
import ffmpegPath from "ffmpeg-static";

const VOICE_PATH = join(process.cwd(), "assets", "narrator-voice.mp3");
const NARRATOR_SPEED = 1.25;

const run = promisify(execFile);

let voiceUrl: Promise<string> | undefined;

async function spedUpVoice() {
	if (!ffmpegPath) throw new Error("ffmpeg is not available on this platform.");
	const dir = await mkdtemp(join(tmpdir(), "narrator-"));
	const input = join(dir, "in.mp3");
	const output = join(dir, "out.mp3");
	try {
		await writeFile(input, await readFile(VOICE_PATH));
		await run(ffmpegPath, [
			"-y",
			"-hide_banner",
			"-loglevel",
			"error",
			"-i",
			input,
			"-filter:a",
			`atempo=${NARRATOR_SPEED}`,
			"-vn",
			output,
		]);
		return await readFile(output);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

export function narratorVoiceUrl() {
	voiceUrl ??= spedUpVoice()
		.then((bytes) =>
			fal.storage.upload(
				new File([bytes], "narrator-voice.mp3", { type: "audio/mpeg" }),
			),
		)
		.catch((error) => {
			voiceUrl = undefined;
			throw error;
		});
	return voiceUrl;
}
