import { createFileRoute } from "@tanstack/react-router";
import {
	createUIMessageStream,
	createUIMessageStreamResponse,
	generateId,
} from "ai";

import type { ExplainerUIMessage } from "#/lib/explainer";
import { generateExplainer } from "#/server/generate-explainer";
import { generateVideo } from "#/server/generate-video";

function videoErrorText(error: unknown) {
	const message =
		error instanceof Error ? error.message : "Video generation failed.";
	const scrubbed = message.replace(/\bKey\s+\S+/gi, "Key");
	if (!scrubbed || scrubbed.length > 240 || /fal[_-]?key/i.test(scrubbed)) {
		return "Video generation failed.";
	}
	return scrubbed;
}

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!process.env.FAL_KEY) {
					return new Response("FAL_KEY is not set. Add it to .env.local.", {
						status: 500,
					});
				}

				const { messages }: { messages: ExplainerUIMessage[] } =
					await request.json();

				const stream = createUIMessageStream<ExplainerUIMessage>({
					execute: async ({ writer }) => {
						const explainer = await generateExplainer(messages);
						const toolCallId = generateId();
						writer.write({
							type: "tool-input-available",
							toolCallId,
							toolName: "createExplainerVideo",
							input: explainer,
						});
						try {
							const videoUrl = await generateVideo(explainer);
							writer.write({
								type: "tool-output-available",
								toolCallId,
								output: { videoUrl },
							});
						} catch (error) {
							writer.write({
								type: "tool-output-error",
								toolCallId,
								errorText: videoErrorText(error),
							});
						}
					},
					onError: (error) =>
						error instanceof Error ? error.message : "Something went wrong.",
				});

				return createUIMessageStreamResponse({ stream });
			},
		},
	},
});
