import type { Explainer, ExplainerVideoInvocation } from "#/lib/explainer";

const PLACEHOLDER_VIDEO = "/examples/placeholder.mp4?v=4x3";

const STYLE = "Warm photographic look, natural light, calm measured narrator.";

function example(
	id: string,
	input: Pick<Explainer, "title" | "takeaway"> & {
		narration: string;
	},
): ExplainerVideoInvocation {
	return {
		toolCallId: id,
		state: "output-available",
		input: {
			styleBible: STYLE,
			title: input.title,
			takeaway: input.takeaway,
			totalSeconds: 5,
			scenes: [
				{
					beat: "hook",
					durationSeconds: 5,
					videoPrompt: `A calm narrator says, "${input.narration}"`,
				},
			],
			followUps: [],
		},
		output: { videoUrl: PLACEHOLDER_VIDEO },
	};
}

export const LANDING_EXAMPLES: ExplainerVideoInvocation[] = [
	example("example-fed", {
		title: "The Fed nudged rates higher",
		takeaway:
			"Loans get a little more expensive, and cash starts paying a bit more.",
		narration:
			"The Fed raised rates a notch, so borrowing costs a little more.",
	}),
	example("example-retail", {
		title: "Shoppers spent more last month",
		takeaway:
			"The jump was real, but gas prices and tax refunds did a lot of the lifting.",
		narration: "Retail sales jumped, helped by gasoline and tax refunds.",
	}),
	example("example-eu-canada", {
		title: "Canada could move closer to Europe",
		takeaway:
			"A tighter European tie matters most if selling into the U.S. keeps getting harder.",
		narration:
			"Europe floated a closer tie with Canada after U.S. trade pressure.",
	}),
	example("example-ai-pause", {
		title: "Companies are not pausing on AI",
		takeaway:
			"Most firms would rather pay for AI now than risk falling behind a rival.",
		narration:
			"Companies are unlikely to pause AI, because their rivals will not.",
	}),
];
