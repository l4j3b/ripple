import type { UIMessage, UIToolInvocation } from "ai";
import { z } from "zod";

export const MAX_VIDEO_SECONDS = 15;
const MIN_VIDEO_SECONDS = 5;

export const explainerSchema = z.object({
	title: z.string().min(1),
	takeaway: z.string().min(1),
	durationSeconds: z.coerce
		.number()
		.transform((seconds) =>
			Math.min(
				MAX_VIDEO_SECONDS,
				Math.max(MIN_VIDEO_SECONDS, Math.round(seconds)),
			),
		),
	videoPrompt: z.string().min(1),
});

export type Explainer = z.infer<typeof explainerSchema>;

export type ExplainerUITools = {
	createExplainerVideo: {
		input: Explainer;
		output: { videoUrl: string };
	};
};

export type ExplainerUIMessage = UIMessage<never, never, ExplainerUITools>;

export type ExplainerVideoInvocation = UIToolInvocation<
	ExplainerUITools["createExplainerVideo"]
>;
