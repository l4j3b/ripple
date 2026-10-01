import { fal } from "@fal-ai/client";

import {
	type Explainer,
	type ExplainerProgress,
	sceneVideoPrompt,
} from "#/lib/explainer";
import { joinVideos } from "#/server/join-videos";

const VIDEO_MODEL = "minimax/h3-max/text-to-video";

type H3MaxVideoInput = {
	prompt: string;
	duration: number;
	resolution: "768P";
	aspect_ratio: "16:9";
	prompt_expansion_mode: "disabled";
};

type VideoOutput = {
	video?: { url?: string };
};

// Native audio is always part of the mp4. Spoken narration goes in the prompt;
// there is no audio flag. target_audio_url only pins an external clip.
const subscribeH3Max = (input: H3MaxVideoInput) =>
	fal.subscribe(VIDEO_MODEL, { input });

async function generateScene(prompt: string, duration: number) {
	const { data } = await subscribeH3Max({
		prompt,
		duration,
		resolution: "768P",
		aspect_ratio: "16:9",
		prompt_expansion_mode: "disabled",
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
