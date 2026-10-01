import type { UIMessage, UIToolInvocation } from "ai";
import { z } from "zod";

export const MAX_SCENE_SECONDS = 15;
export const MIN_SCENE_SECONDS = 5;
export const MAX_SCENES = 18;
export const MAX_TOTAL_SECONDS = 180;

export const WORDS_PER_SECOND = 2.3;

const sceneSchema = z
	.object({
		beat: z.string().optional(),
		durationSeconds: z.coerce.number(),
		videoPrompt: z.string().min(1),
	})
	.transform((scene) => {
		const words = sceneNarration(scene.videoPrompt)
			.split(/\s+/)
			.filter(Boolean).length;
		const needed = Math.ceil(words / WORDS_PER_SECOND);
		const seconds = Math.max(Math.round(scene.durationSeconds), needed);
		return {
			...scene,
			durationSeconds: Math.min(
				MAX_SCENE_SECONDS,
				Math.max(MIN_SCENE_SECONDS, seconds),
			),
		};
	});

export type Scene = z.infer<typeof sceneSchema>;

export const explainerSchema = z
	.object({
		analysis: z.string().optional(),
		metaphor: z.string().optional(),
		styleBible: z.string().min(1),
		title: z.string().min(1),
		takeaway: z.string().min(1),
		totalSeconds: z.coerce.number().optional(),
		scenes: z.array(sceneSchema).min(1),
	})
	.transform((explainer) => {
		const scenes: Scene[] = [];
		let total = 0;
		for (const scene of explainer.scenes.slice(0, MAX_SCENES)) {
			if (
				scenes.length > 0 &&
				total + scene.durationSeconds > MAX_TOTAL_SECONDS
			)
				break;
			scenes.push(scene);
			total += scene.durationSeconds;
		}
		return { ...explainer, scenes, totalSeconds: total };
	});

export type Explainer = z.infer<typeof explainerSchema>;

export const NO_TEXT_RULE =
	"No on-screen text, numbers, charts, logos, tickers, labels, dials, or real public figures.";

export function sceneVideoPrompt(explainer: Explainer, scene: Scene) {
	const prompt = scene.videoPrompt.trim();
	const withStyle = prompt.startsWith(explainer.styleBible)
		? prompt
		: `${explainer.styleBible}\n\n${prompt}`;
	return `${withStyle}\n\n${NO_TEXT_RULE}`;
}

export function sceneNarration(videoPrompt: string) {
	return videoPrompt.match(/says,?\s*[“"]([^”"]+)[”"]/i)?.[1] ?? videoPrompt;
}

export type ExplainerProgress = {
	stage: "scenes" | "stitching";
	scenesDone: number;
	scenesTotal: number;
};

export type ExplainerUITools = {
	createExplainerVideo: {
		input: Explainer;
		output: { videoUrl?: string; progress?: ExplainerProgress };
	};
};

export type ExplainerUIMessage = UIMessage<never, never, ExplainerUITools>;

export type ExplainerVideoInvocation = UIToolInvocation<
	ExplainerUITools["createExplainerVideo"]
>;
