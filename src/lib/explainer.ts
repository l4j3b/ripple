import type { UIMessage, UIToolInvocation } from "ai";
import { z } from "zod";

export const MAX_SCENE_SECONDS = 15;
export const MIN_SCENE_SECONDS = 5;
export const TYPICAL_SCENE_SECONDS = [8, 12] as const;
export const MAX_SCENES = 20;
export const MAX_TOTAL_SECONDS = 180;

export const WORDS_PER_SECOND = 3.2;

export type VideoAspectRatio = "4:3" | "16:9";
export const VIDEO_ASPECT_RATIO: VideoAspectRatio = "4:3";

export const VIDEO_LOOKS = ["cinematic", "animated"] as const;
export const SCENE_VISUALS = ["metaphor", "graphic"] as const;

const sceneSchema = z
	.object({
		beat: z.string().optional(),
		visual: z.enum(SCENE_VISUALS).catch("metaphor"),
		durationSeconds: z.coerce.number(),
		videoPrompt: z.string().min(1),
	})
	.transform((scene) => {
		const words = sceneNarration(scene.videoPrompt)
			.split(/\s+/)
			.filter(Boolean).length;
		// Clips longer than the narration make the narrator stretch the speech.
		const seconds = Math.ceil(words / WORDS_PER_SECOND);
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
		recurringElements: z.array(z.string()).optional(),
		look: z.enum(VIDEO_LOOKS).catch("cinematic"),
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

const ANIMATED_STYLE =
	"Stylized 3D isometric animation: a miniature world on a floating tile, soft clay-like materials, rounded shapes, soft studio lighting, slow orbiting camera.";

const GRAPHIC_STYLE =
	"Clean flat 2D motion graphic in a modern explainer style, on a dark navy background (#0B1220) with a faint grid. Teal (#2DD4BF) and purple (#8B5CF6) accents, green for up and red for down, bold white uppercase sans-serif labels. Smooth eased animation. The bottom quarter of the frame stays empty.";

const NARRATOR_VOICE =
	"Voice-over by a single off-screen narrator. Match the voice in Audio 1 exactly: the same speaker, timbre, accent, and delivery, as a clean close-mic studio recording. Brisk, energetic pace with no long pauses. Nobody on screen speaks or moves their lips. Underneath the voice, only the quiet ambient sound described for this scene. No music.";

const NEGATIVE_RULE =
	"No other text, garbled characters, misspellings, watermarks, logos, or real public figures.";

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
	const base = Math.floor(words.length / count);
	const extra = words.length % count;
	const chunks: string[][] = [];
	let start = 0;
	for (let i = 0; i < count; i++) {
		const size = base + (i < extra ? 1 : 0);
		chunks.push(words.slice(start, start + size));
		start += size;
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

function sceneStyle(explainer: Explainer, scene: Scene) {
	if (scene.visual === "graphic") return GRAPHIC_STYLE;
	if (explainer.look === "animated") {
		return `${ANIMATED_STYLE} ${explainer.styleBible}`;
	}
	return explainer.styleBible;
}

export function sceneVideoPrompt(explainer: Explainer, scene: Scene) {
	const prompt = scene.videoPrompt.trim();
	const style = sceneStyle(explainer, scene);
	const withStyle = prompt.startsWith(explainer.styleBible)
		? prompt
		: `${style}\n\n${prompt}`;
	const narration = narrationQuote(prompt);
	const captions = narration
		? `\n\n${CAPTION_STYLE} The captions appear in this exact order: ${captionChunks(
				narration,
			)
				.map((chunk) => `"${chunk}"`)
				.join(", then ")}. Captions spelled correctly.`
		: "";
	return `${withStyle}\n\n${NARRATOR_VOICE}${captions}\n\n${NEGATIVE_RULE}`;
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
