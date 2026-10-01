import { fal } from "@fal-ai/client";

import type { Explainer } from "#/lib/explainer";

const VIDEO_MODEL = "minimax/h3-max/text-to-video";

type H3MaxVideoInput = {
	prompt: string;
	duration: number;
	resolution: "768P";
	aspect_ratio: "16:9";
	prompt_expansion_mode: "disabled";
};

type H3MaxVideoOutput = {
	video?: { url?: string };
};

// Native audio is always part of the mp4. Spoken narration goes in the prompt;
// there is no audio flag. target_audio_url only pins an external clip.
const subscribeH3Max = (input: H3MaxVideoInput) =>
	fal.subscribe(VIDEO_MODEL, { input });

export async function generateVideo(explainer: Explainer): Promise<string> {
	const { data } = await subscribeH3Max({
		prompt: explainer.videoPrompt,
		duration: explainer.durationSeconds,
		resolution: "768P",
		aspect_ratio: "16:9",
		prompt_expansion_mode: "disabled",
	});

	const videoUrl = (data as H3MaxVideoOutput).video?.url;
	if (!videoUrl) {
		throw new Error("The video model did not return a video URL.");
	}
	return videoUrl;
}
