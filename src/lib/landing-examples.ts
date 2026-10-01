import type { Explainer, ExplainerVideoInvocation } from "#/lib/explainer";

const PLACEHOLDER_VIDEO = "/examples/placeholder.mp4?v=4x3";

const STYLE = "Warm photographic look, natural light, calm measured narrator.";

function example(
	id: string,
	input: Pick<Explainer, "title" | "takeaway" | "followUps"> & {
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
			followUps: input.followUps,
		},
		output: { videoUrl: PLACEHOLDER_VIDEO },
	};
}

export type LandingExample = {
	label: string;
	prompt: string;
	invocation: ExplainerVideoInvocation;
};

export const LANDING_EXAMPLES: LandingExample[] = [
	{
		label: "Fed raises rates a quarter point",
		prompt: "Fed raises rates a quarter point in first move of Warsh era",
		invocation: example("example-fed", {
			title: "The Fed nudged rates higher",
			takeaway:
				"Loans get a little more expensive, and cash starts paying a bit more.",
			narration:
				"The Fed raised rates a notch, so borrowing costs a little more.",
			followUps: [
				"Who feels the rate hike first?",
				"What happens to savings accounts?",
				"Do mortgage rates move right away?",
			],
		}),
	},
	{
		label: "Retail sales surge the most since March",
		prompt:
			"Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
		invocation: example("example-retail", {
			title: "Shoppers spent more last month",
			takeaway:
				"The jump was real, but gas prices and tax refunds did a lot of the lifting.",
			narration: "Retail sales jumped, helped by gasoline and tax refunds.",
			followUps: [
				"Was the jump mostly gasoline?",
				"What does this say about household spending?",
				"How might stores react?",
			],
		}),
	},
	{
		label: "EU floats associate membership for Canada",
		prompt:
			"EU chief floats associate membership for Canada after U.S. trade attacks",
		invocation: example("example-eu-canada", {
			title: "Canada could move closer to Europe",
			takeaway:
				"A tighter European tie matters most if selling into the U.S. keeps getting harder.",
			narration:
				"Europe floated a closer tie with Canada after U.S. trade pressure.",
			followUps: [
				"What would associate membership change?",
				"Who gains if Canada sells less to the U.S.?",
				"How fast could this happen?",
			],
		}),
	},
	{
		label: "Why companies won't pause on AI (WSJ)",
		prompt:
			"https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
		invocation: example("example-ai-pause", {
			title: "Companies are not pausing on AI",
			takeaway:
				"Most firms would rather pay for AI now than risk falling behind a rival.",
			narration:
				"Companies are unlikely to pause AI, because their rivals will not.",
			followUps: [
				"Which companies are spending the most?",
				"What happens to firms that do pause?",
				"Where does the money for AI come from?",
			],
		}),
	},
];
