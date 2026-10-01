import type { UIMessage, UIToolInvocation } from "ai";
import { z } from "zod";

export const MAX_SCENE_SECONDS = 15;
export const MIN_SCENE_SECONDS = 5;
export const MAX_SCENES = 18;
export const MAX_TOTAL_SECONDS = 180;

export const WORDS_PER_SECOND = 2.3;

export type VideoAspectRatio = "4:3" | "16:9";
export const VIDEO_ASPECT_RATIO: VideoAspectRatio = "4:3";

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
		followUps: z.array(z.string()).optional(),
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
		const followUps = (explainer.followUps ?? [])
			.map((question) => question.trim())
			.filter(Boolean)
			.slice(0, 3);
		return { ...explainer, scenes, totalSeconds: total, followUps };
	});

export type Explainer = z.infer<typeof explainerSchema>;

const CAPTION_STYLE =
	"TikTok-style animated captions, timed to the voice: a single centered line near the bottom of the frame, bold uppercase sans-serif text with letters about 7% of the frame height, the same size and position for every caption. All caption text is pure white (#FFFFFF). The word being spoken is highlighted with a solid vivid purple (#8B5CF6) rounded box behind it while its text stays white. Each caption pops in as it is spoken and replaces the previous one.";

const MAX_CAPTION_WORDS = 4;
const CONNECTORS = new Set([
	"a",
	"an",
	"and",
	"as",
	"at",
	"by",
	"for",
	"from",
	"in",
	"into",
	"of",
	"on",
	"or",
	"the",
	"to",
	"with",
]);

function splitPhrase(words: string[]) {
	const count = Math.ceil(words.length / MAX_CAPTION_WORDS);
	const size = Math.ceil(words.length / count);
	const chunks: string[][] = [];
	for (let i = 0; i < words.length; i += size) {
		chunks.push(words.slice(i, i + size));
	}
	for (let i = 0; i < chunks.length - 1; i++) {
		const chunk = chunks[i];
		const last = chunk.at(-1)?.toLowerCase();
		if (chunk.length > 1 && last && CONNECTORS.has(last)) {
			chunks[i + 1].unshift(chunk.pop() as string);
		}
	}
	return chunks;
}

export function captionChunks(narration: string) {
	const phrases: string[][] = [[]];
	for (const word of narration.split(/\s+/).filter(Boolean)) {
		phrases.at(-1)?.push(word);
		if (/[.,;:!?—]$/.test(word)) phrases.push([]);
	}
	return phrases
		.filter((phrase) => phrase.length > 0)
		.flatMap(splitPhrase)
		.map((chunk) => chunk.join(" ").toUpperCase());
}

function narrationQuote(videoPrompt: string) {
	return videoPrompt.match(/says,?\s*[“"]([^”"]+)[”"]/i)?.[1];
}

export function sceneVideoPrompt(explainer: Explainer, scene: Scene) {
	const prompt = scene.videoPrompt.trim();
	const withStyle = prompt.startsWith(explainer.styleBible)
		? prompt
		: `${explainer.styleBible}\n\n${prompt}`;
	const narration = narrationQuote(prompt);
	const captions = narration
		? `\n\n${CAPTION_STYLE} The captions appear in this exact order: ${captionChunks(
				narration,
			)
				.map((chunk) => `"${chunk}"`)
				.join(", then ")}. Captions spelled correctly.`
		: "";
	return `${withStyle}${captions}`;
}

export function sceneNarration(videoPrompt: string) {
	return narrationQuote(videoPrompt) ?? videoPrompt;
}

export type ExplainerProgress = {
	stage: "scenes" | "stitching";
	scenesDone: number;
	scenesTotal: number;
};

export type ExplainerPrepStage = "retrieving" | "writing";

export type ExplainerUITools = {
	createExplainerVideo: {
		input: Explainer;
		output: { videoUrl?: string; progress?: ExplainerProgress };
	};
};

export type ExplainerUIMessage = UIMessage<
	never,
	{ status: { stage: ExplainerPrepStage } },
	ExplainerUITools
>;

export type ExplainerVideoInvocation = UIToolInvocation<
	ExplainerUITools["createExplainerVideo"]
>;
