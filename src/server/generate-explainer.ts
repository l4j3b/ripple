import { fal } from "@fal-ai/client";

import {
	type Explainer,
	type ExplainerInput,
	type ExplainerPrepStage,
	type ExplainerUIMessage,
	explainerSchema,
	sceneNarration,
} from "#/lib/explainer";
import { EXPLAINER_INSTRUCTIONS } from "#/lib/prompts";
import { escapeTags, retrieveLinkedArticles } from "#/server/retrieve-url";

const DEFAULT_MODEL = "anthropic/claude-sonnet-5.5";
const MAX_ATTEMPTS = 2;

function toTranscript(messages: ExplainerUIMessage[]) {
	return messages
		.map((message) => {
			if (message.role === "user") {
				const text = message.parts
					.map((part) => (part.type === "text" ? part.text : ""))
					.join("");
				return `<user>\n${escapeTags(text)}\n</user>`;
			}
			const video = message.parts.find(
				(part) => part.type === "tool-createExplainerVideo" && part.input,
			);
			if (video?.type !== "tool-createExplainerVideo" || !video.input) {
				return null;
			}
			const { sources, ...plan } = video.input;
			return [
				sources ? `<source_material>\n${sources}\n</source_material>` : "",
				`<previous_video>\n${escapeTags(JSON.stringify(plan))}\n</previous_video>`,
			]
				.filter(Boolean)
				.join("\n\n");
		})
		.filter(Boolean)
		.join("\n\n");
}

function latestUserText(messages: ExplainerUIMessage[]) {
	let latest: ExplainerUIMessage | undefined;
	for (let index = messages.length - 1; index >= 0; index--) {
		if (messages[index]?.role === "user") {
			latest = messages[index];
			break;
		}
	}
	if (!latest) return "";
	return latest.parts
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");
}

function parseExplainer(output: string) {
	const start = output.indexOf("{");
	const end = output.lastIndexOf("}");
	if (start === -1 || end === -1) {
		return { success: false as const, error: "No JSON object in the reply." };
	}
	try {
		const result = explainerSchema.safeParse(
			JSON.parse(output.slice(start, end + 1)),
		);
		return result.success
			? { success: true as const, data: result.data }
			: { success: false as const, error: result.error.message };
	} catch {
		return { success: false as const, error: "The reply was not valid JSON." };
	}
}

export async function generateExplainer(
	messages: ExplainerUIMessage[],
	onStatus?: (stage: ExplainerPrepStage) => void,
): Promise<ExplainerInput> {
	const latest = latestUserText(messages);
	if (/\bhttps?:\/\//i.test(latest)) onStatus?.("retrieving");
	const sources = await retrieveLinkedArticles(latest);
	onStatus?.("writing");
	let prompt = [
		`Today's date: ${new Date().toISOString().slice(0, 10)}.`,
		`<conversation>\n${toTranscript(messages)}\n</conversation>`,
		sources ? `<source_material>\n${sources}\n</source_material>` : "",
		"Plan the video for the last user message in the conversation.",
	]
		.filter(Boolean)
		.join("\n\n");
	let lastError = "";

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const { data } = await fal.subscribe("openrouter/router", {
			input: {
				model: process.env.LLM_MODEL ?? DEFAULT_MODEL,
				// Required by newer Claude models; the reasoning comes back
				// separately, so the output stays plain JSON.
				reasoning: true,
				system_prompt: EXPLAINER_INSTRUCTIONS,
				prompt,
			},
		});
		if (data.error) {
			throw new Error(data.error);
		}

		const parsed = parseExplainer(data.output);
		if (parsed.success) {
			logScript(parsed.data);
			return { ...parsed.data, sources: sources || undefined };
		}
		lastError = parsed.error;
		prompt += `\n\nYour previous reply could not be used (${lastError}). Reply again with only the JSON object.`;
	}

	throw new Error(`The model returned an unusable reply: ${lastError}`);
}

function logScript(explainer: Explainer) {
	console.log(
		`script: ${explainer.title} | ${explainer.look} | ${explainer.totalSeconds}s, ${explainer.scenes.length} scenes`,
	);
	console.log("style:", explainer.styleBible);
	if (explainer.recurringElements?.length) {
		console.log("recurring:", explainer.recurringElements);
	}
	for (const [index, scene] of explainer.scenes.entries()) {
		const narration = sceneNarration(scene.videoPrompt);
		const words = narration.split(/\s+/).filter(Boolean).length;
		console.log(
			`[${index + 1} ${scene.beat ?? "scene"} · ${scene.visual} · ${scene.durationSeconds}s, ${words} words]\n${scene.videoPrompt}`,
		);
		if (scene.diagram) console.log("diagram:", scene.diagram);
	}
}
