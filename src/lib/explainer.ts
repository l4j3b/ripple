import type { UIMessage, UIToolInvocation } from "ai";
import { z } from "zod";

export const MAX_SCENE_SECONDS = 15;
export const MIN_SCENE_SECONDS = 5;
export const TYPICAL_SCENE_SECONDS = [8, 12] as const;
export const MAX_SCENES = 20;
export const MAX_TOTAL_SECONDS = 180;

export const WORDS_PER_SECOND = 3.2;

// Measured on generated scenes: the narrator stretches speech to fill the clip,
// sounds natural near 3.1 words per second, and repeats words below about 2.7.
// Clips also run about 0.4 seconds past the requested duration.
const NARRATOR_WORDS_PER_SECOND = 3.1;
const MIN_NARRATOR_WORDS_PER_SECOND = 2.7;
const CLIP_OVERRUN_SECONDS = 0.4;
// Held after each clip when scenes are joined, so the last word isn't cut off.
export const SCENE_PAD_SECONDS = 0.3;

export const MIN_SCENE_WORDS = Math.ceil(
	MIN_NARRATOR_WORDS_PER_SECOND * (MIN_SCENE_SECONDS + CLIP_OVERRUN_SECONDS),
);
export const MAX_SCENE_WORDS = Math.floor(MAX_SCENE_SECONDS * WORDS_PER_SECOND);

function wordCount(text: string) {
	return text.split(/\s+/).filter(Boolean).length;
}

function durationForWords(words: number) {
	const seconds = Math.round(
		words / NARRATOR_WORDS_PER_SECOND - CLIP_OVERRUN_SECONDS,
	);
	return Math.min(MAX_SCENE_SECONDS, Math.max(MIN_SCENE_SECONDS, seconds));
}

export type VideoAspectRatio = "4:3" | "16:9";
export const VIDEO_ASPECT_RATIO: VideoAspectRatio = "4:3";

export const VIDEO_LOOKS = ["cinematic"] as const;
export const SCENE_VISUALS = ["metaphor", "graphic"] as const;
export const DIAGRAM_TYPES = [
	"cards",
	"chain",
	"trend",
	"versus",
	"gauge",
] as const;
export const MAX_CARDS = 3;
export const MAX_CHAIN_STEPS = 4;
export const MAX_TREND_SEGMENTS = 2;

const directionSchema = z.enum(["up", "down", "flat"]);
type Direction = z.infer<typeof directionSchema>;

const labelSchema = z
	.string()
	.transform((label) => label.trim().toUpperCase())
	.pipe(z.string().min(1));

const cardSchema = z.object({ label: labelSchema, direction: directionSchema });

export type GraphicCard = z.infer<typeof cardSchema>;

const diagramSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("cards"),
		cards: z
			.array(cardSchema.nullable().catch(null))
			.transform((cards) =>
				cards
					.filter((card): card is GraphicCard => card !== null)
					.slice(0, MAX_CARDS),
			)
			.pipe(z.array(cardSchema).min(1)),
	}),
	z.object({
		type: z.literal("chain"),
		steps: z.array(labelSchema).min(2).max(MAX_CHAIN_STEPS),
	}),
	z.object({
		type: z.literal("trend"),
		label: labelSchema,
		segments: z.array(directionSchema).min(1).max(MAX_TREND_SEGMENTS),
	}),
	z.object({
		type: z.literal("versus"),
		left: labelSchema,
		right: labelSchema,
		bigger: z.enum(["left", "right"]),
	}),
	z.object({
		type: z.literal("gauge"),
		label: labelSchema,
		direction: z.enum(["up", "down"]),
	}),
]);

export type GraphicDiagram = z.infer<typeof diagramSchema>;

const sceneSchema = z
	.object({
		beat: z.string().optional(),
		visual: z.enum(SCENE_VISUALS).catch("metaphor"),
		durationSeconds: z.coerce.number(),
		videoPrompt: z.string().min(1),
		diagram: diagramSchema.nullish(),
	})
	.superRefine((scene, ctx) => {
		if (scene.visual === "graphic" && !scene.diagram) {
			ctx.addIssue({
				code: "custom",
				message: `The graphic scene with narration "${sceneNarration(scene.videoPrompt)}" needs a "diagram" of one of these types: ${DIAGRAM_TYPES.join(", ")}.`,
			});
		}
	})
	.transform((scene) => ({
		...scene,
		durationSeconds: durationForWords(
			wordCount(sceneNarration(scene.videoPrompt)),
		),
	}));

export type Scene = z.infer<typeof sceneSchema>;

// A clip longer than its narration makes the narrator repeat words. The model
// is told to lengthen a short line or merge it; if it still comes back short,
// fold that line into a neighbor so the video can generate.
function foldShortScenes(scenes: Scene[]) {
	const folded = [...scenes];
	let index = 0;
	while (index < folded.length) {
		const narration = sceneNarration(folded[index].videoPrompt);
		if (wordCount(narration) >= MIN_SCENE_WORDS || folded.length === 1) {
			index += 1;
			continue;
		}
		if (index === 0) {
			folded[1] = withNarration(folded[1], narration, "prepend");
			folded.shift();
			continue;
		}
		folded[index - 1] = withNarration(folded[index - 1], narration, "append");
		folded.splice(index, 1);
		if (
			wordCount(sceneNarration(folded[index - 1].videoPrompt)) < MIN_SCENE_WORDS
		) {
			index -= 1;
		}
	}
	return folded;
}

function withNarration(
	scene: Scene,
	extra: string,
	placement: "append" | "prepend",
) {
	const current = sceneNarration(scene.videoPrompt).trim();
	const added = extra.trim();
	const narration =
		placement === "append" ? `${current} ${added}` : `${added} ${current}`;
	return {
		...scene,
		videoPrompt: replaceNarration(scene.videoPrompt, narration),
		durationSeconds: durationForWords(wordCount(narration)),
	};
}

function replaceNarration(videoPrompt: string, narration: string) {
	const match = videoPrompt.match(/says,?\s*[“"]([^”"]+)[”"]/di);
	const bounds = match?.indices?.[1];
	if (!bounds) return `${videoPrompt} A narrator says, "${narration}"`;
	return (
		videoPrompt.slice(0, bounds[0]) + narration + videoPrompt.slice(bounds[1])
	);
}

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
		// If the plan runs over, cut from the middle rather than the end, so the
		// closing scene with the caveat and what to watch always survives.
		const planned = foldShortScenes(explainer.scenes);
		const closing = planned.at(-1) as Scene;
		const scenes: Scene[] = [];
		let total = closing.durationSeconds;
		for (const scene of planned.slice(0, -1)) {
			if (
				scenes.length + 2 > MAX_SCENES ||
				total + scene.durationSeconds > MAX_TOTAL_SECONDS
			)
				break;
			scenes.push(scene);
			total += scene.durationSeconds;
		}
		scenes.push(closing);
		const followUps = (explainer.followUps ?? [])
			.map((question) => question.trim())
			.filter(Boolean)
			.slice(0, 3);
		return { ...explainer, scenes, totalSeconds: total, followUps };
	});

export type Explainer = z.infer<typeof explainerSchema>;

const GRAPHIC_STYLE =
	"Clean flat 2D motion graphic in a modern explainer style, on a dark navy background (#0B1220) with a faint grid. Teal (#2DD4BF) and purple (#8B5CF6) accents, bold white uppercase sans-serif labels. Smooth eased animation. The bottom quarter of the frame stays empty.";

const NARRATOR_VOICE =
	"Voice-over by a single off-screen narrator. Match the voice in Audio 1 exactly: the same speaker, timbre, accent, and delivery, as a clean close-mic studio recording. Brisk, energetic pace with no long pauses. Do not repeat any word or phrase, and do not add, skip, or reword anything in the quoted narration. Nobody on screen speaks or moves their lips. Underneath the voice, only the quiet ambient sound described for this scene. No music.";

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

const DIAGRAM_AREA = "centered in the upper three quarters of the frame";
const HOLD_STILL =
	"Apart from the animation described, nothing tilts, flips, or moves, and labels never swap or reorder.";
const ORDINALS = ["first", "second", "third", "fourth"];
const COUNTS = ["", "one", "two", "three", "four"];

const CARD_ARROWS: Record<Direction, string> = {
	up: "one large green arrow pointing straight up",
	down: "one large red arrow pointing straight down",
	flat: "one short flat grey horizontal bar",
};

const CARD_LAYOUTS: Record<number, { intro: string; positions: string[] }> = {
	1: { intro: "One rounded rectangular card", positions: ["card"] },
	2: {
		intro: "Exactly two identical rounded rectangular cards side by side",
		positions: ["left card", "right card"],
	},
	3: {
		intro: "Exactly three identical rounded rectangular cards side by side",
		positions: ["left card", "middle card", "right card"],
	},
};

function graphicCardsPrompt(cards: GraphicCard[]) {
	const { intro, positions } = CARD_LAYOUTS[cards.length];
	const items = cards
		.map(
			(card, index) =>
				`The ${positions[index]} is labeled "${card.label}" and has ${CARD_ARROWS[card.direction]} directly below the label.`,
		)
		.join(" ");
	const layout =
		cards.length === 1 ? DIAGRAM_AREA : `in one horizontal row ${DIAGRAM_AREA}`;
	const entrance =
		cards.length === 1
			? "The card fades in, its arrow grows in the direction it points, then everything holds still."
			: "The cards fade in one after another from left to right, each arrow grows in the direction it points, then everything holds still.";
	return `${intro}, ${layout}. ${items} ${entrance} Each card shows only its label and its one arrow. Do not add any other arrows, icons, placeholder lines, numbers, charts, or text. Do not change any arrow's color or direction. ${HOLD_STILL}`;
}

function chainPrompt(steps: string[]) {
	const boxes = steps
		.map((step, index) => `the ${ORDINALS[index]} is labeled "${step}"`)
		.join(", ");
	return `Exactly ${COUNTS[steps.length]} teal-outlined rounded rectangular boxes in one horizontal row ${DIAGRAM_AREA}, read from left to right: ${boxes}. Between each pair of neighboring boxes, one short white arrow points right to the next box. The boxes appear one at a time from left to right, each arrow drawing itself toward the next box just before that box appears, then everything holds still. Each box shows only its label. Do not add any other boxes, arrows, icons, lines, numbers, or text. Do not point any arrow left, up, or down. ${HOLD_STILL}`;
}

const TREND_PATHS: Record<Direction, string> = {
	up: "rises steadily",
	down: "falls steadily",
	flat: "stays level",
};

function trendPrompt(label: string, segments: Direction[]) {
	const [first, second] = segments;
	const path = second
		? `${TREND_PATHS[first]} across the left half of the frame, then turns at the center and ${TREND_PATHS[second]} across the right half`
		: `${TREND_PATHS[first]} from the left edge to the right edge`;
	return `One thick teal line chart ${DIAGRAM_AREA}, with the label "${label}" above the upper left of the line. The line ${path}. It draws itself from left to right with a glowing dot at its tip, then holds still. Do not add axes, tick marks, scales, numbers, bars, a second line, or any other text. Do not change the line's shape or direction. ${HOLD_STILL}`;
}

function versusPrompt(left: string, right: string, bigger: "left" | "right") {
	const smaller = bigger === "left" ? "right" : "left";
	return `Two vertical bars side by side, standing on one short white baseline ${DIAGRAM_AREA}. The left bar is labeled "${left}" and the right bar is labeled "${right}", each label directly above its bar. The ${bigger} bar is teal and clearly taller; the ${smaller} bar is purple and clearly shorter. Both bars grow upward from the baseline at the same time, then hold still. Do not add axes, scales, numbers, arrows, icons, a third bar, or any other text. Do not make the ${smaller} bar taller than the ${bigger} bar. ${HOLD_STILL}`;
}

function gaugePrompt(label: string, direction: "up" | "down") {
	const side = direction === "up" ? "right" : "left";
	const end = direction === "up" ? "high" : "low";
	return `One large semicircular dial gauge ${DIAGRAM_AREA}, with the label "${label}" above it. The dial is a smooth teal arc with no markings: its left end means low and its right end means high. One white needle starts pointing straight up at the middle of the arc, then swings smoothly to the ${side} toward the ${end} end and stays there. Do not add tick marks, numbers, a second needle, icons, or any other text. Do not swing the needle to the other side. ${HOLD_STILL}`;
}

function diagramPrompt(diagram: GraphicDiagram) {
	switch (diagram.type) {
		case "cards":
			return graphicCardsPrompt(diagram.cards);
		case "chain":
			return chainPrompt(diagram.steps);
		case "trend":
			return trendPrompt(diagram.label, diagram.segments);
		case "versus":
			return versusPrompt(diagram.left, diagram.right, diagram.bigger);
		case "gauge":
			return gaugePrompt(diagram.label, diagram.direction);
	}
}

function sceneBody(scene: Scene) {
	const prompt = scene.videoPrompt.trim();
	if (scene.visual !== "graphic" || !scene.diagram) return prompt;
	const sound =
		prompt.match(/Sound:[^.]*\./i)?.[0] ??
		"Sound: soft whooshes as each element appears.";
	const narration = narrationQuote(prompt);
	const voice = narration ? ` A narrator says, "${narration}"` : "";
	return `${diagramPrompt(scene.diagram)} ${sound}${voice}`;
}

function sceneStyle(explainer: Explainer, scene: Scene) {
	if (scene.visual === "graphic") return GRAPHIC_STYLE;
	return explainer.styleBible;
}

export function sceneVideoPrompt(explainer: Explainer, scene: Scene) {
	const prompt = sceneBody(scene);
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

export type ExplainerInput = Explainer & {
	// Articles retrieved for this turn, sent back with later turns so
	// follow-ups stay grounded in the original reporting.
	sources?: string;
};

export type ExplainerUITools = {
	createExplainerVideo: {
		input: ExplainerInput;
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
