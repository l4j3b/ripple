import { fal } from "@fal-ai/client";

import {
	type Explainer,
	type ExplainerProgress,
	sceneVideoPrompt,
	VIDEO_ASPECT_RATIO,
	type VideoAspectRatio,
} from "#/lib/explainer";
import { joinVideos } from "#/server/join-videos";
import { narratorVoiceUrl } from "#/server/narrator-voice";

const VIDEO_MODEL = "minimax/h3-max/reference-to-video";
const VIDEO_RESOLUTION = "480P";
const VIDEO_SEED = 424242;

type H3MaxVideoInput = {
	prompt: string;
	duration: number;
	resolution: "480P" | "768P" | "1080P";
	aspect_ratio: VideoAspectRatio;
	seed: number;
	prompt_expansion_mode: "disabled";
	reference_audio_urls: string[];
};

type VideoOutput = {
	video?: { url?: string };
};

// The prompt refers to the narrator reference clip as "Audio 1".
const subscribeH3Max = (input: H3MaxVideoInput) =>
	fal.subscribe(VIDEO_MODEL, { input });

async function generateScene(prompt: string, duration: number) {
	const { data } = await subscribeH3Max({
		prompt,
		duration,
		resolution: VIDEO_RESOLUTION,
		aspect_ratio: VIDEO_ASPECT_RATIO,
		seed: VIDEO_SEED,
		prompt_expansion_mode: "disabled",
		reference_audio_urls: [await narratorVoiceUrl()],
	});
	const url = (data as VideoOutput).video?.url;
	if (!url) {
		throw new Error("The video model did not return a video URL.");
	}
	return url;
}

export async function generateVideo(
	explainer: Explainer,
	onProgress?: (progress: ExplainerProgress) => void,
): Promise<string> {
	const scenesTotal = explainer.scenes.length;
	let scenesDone = 0;
	onProgress?.({ stage: "scenes", scenesDone, scenesTotal });

	const sceneUrls = await Promise.all(
		explainer.scenes.map(async (scene) => {
			const url = await generateScene(
				sceneVideoPrompt(explainer, scene),
				scene.durationSeconds,
			);
			scenesDone += 1;
			onProgress?.({ stage: "scenes", scenesDone, scenesTotal });
			return url;
		}),
	);

	if (sceneUrls.length === 1) return sceneUrls[0];

	onProgress?.({ stage: "stitching", scenesDone, scenesTotal });
	return joinVideos(sceneUrls);
}
