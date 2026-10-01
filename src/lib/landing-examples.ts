import type { Explainer, ExplainerVideoInvocation } from "#/lib/explainer";

function example(
	id: string,
	videoUrl: string,
	input: Explainer,
): ExplainerVideoInvocation {
	return {
		toolCallId: id,
		state: "output-available",
		input,
		output: { videoUrl },
	};
}

export type LandingExample = {
	label: string;
	prompt: string;
	poster: string;
	invocation: ExplainerVideoInvocation;
};

export const LANDING_EXAMPLES: LandingExample[] = [
	{
		label: "Fed raises rates a quarter point",
		prompt: "Fed raises rates a quarter point in first move of Warsh era",
		poster: "/examples/fed.jpg",
		invocation: example("example-fed", "/examples/fed.mp4?v=full", {
			analysis:
				"The provided headline says the Fed raised rates by a quarter point in the first move of the Warsh era, but no article text was given. Without the article, I cannot confirm who Warsh is, when this happened, what the Fed said about future moves, or what economic conditions prompted the hike. I can explain in general terms how a rate hike works—the Fed raises its target rate, borrowing costs rise, spending and investment slow, inflation cools—but I cannot report specifics of this event. The video will state plainly that only the headline was available, explain the mechanics of a rate hike and its transmission to the economy, and note that the full picture depends on the Fed's guidance and the economic backdrop, which the missing article would have provided.",
			metaphor: "a dam with sluice gates that control water flow downstream",
			recurringElements: [
				"a large grey concrete dam with three vertical steel sluice gates set into its face",
				"a wide river flowing from the base of the dam through a valley with grassy banks and distant hills",
				"a worker in a navy jacket and white hard hat, seen from behind, standing on the dam's walkway",
			],
			look: "animated",
			styleBible: "Muted earth tones, soft daylight, calm and informative mood",
			title: "Fed raises rates: how a quarter-point hike slows the economy",
			takeaway:
				"A rate hike makes borrowing more expensive, which slows spending and investment and eventually cools inflation.",
			totalSeconds: 40,
			followUps: [
				"Why would the Fed raise rates now?",
				"Who gets hurt most by higher rates?",
				"What happens to stock and bond prices when rates rise?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						"A large grey concrete dam with three vertical steel sluice gates set into its face stands across a valley. A worker in a navy jacket and white hard hat, seen from behind, stands on the dam's walkway and reaches toward a control wheel. A wide river flows from the base of the dam through a valley with grassy banks and distant hills. The camera slowly pushes in toward the dam. Muted earth tones, soft daylight, calm and informative mood. A narrator says, \"The Fed just raised interest rates a quarter point, but the full article wasn't available. Here's how a rate hike works.\"",
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 9,
					videoPrompt:
						"A large grey concrete dam with three vertical steel sluice gates set into its face stands across a valley. A worker in a navy jacket and white hard hat, seen from behind, grips a large steel control wheel mounted on the dam's walkway and turns it slowly. One of the three vertical steel sluice gates begins to lower, narrowing the gap through which water flows. The camera holds steady at mid-distance. Muted earth tones, soft daylight, calm and informative mood. A narrator says, \"The Fed sets the cost of overnight borrowing between banks. When it raises that rate, it's like closing a gate: less money flows into the economy.\"",
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A wide river flowing from the base of a large grey concrete dam through a valley with grassy banks and distant hills. The water level visibly drops, and the flow slows to a gentler current. The camera tilts down slightly to follow the receding waterline. Muted earth tones, soft daylight, calm and informative mood. A narrator says, "Banks pass higher costs to borrowers, so mortgages, car loans, and business credit all get more expensive."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 5,
					videoPrompt:
						'Three rectangular cards arranged in a loose column. The top card is labeled "MORTGAGES", the middle card "CAR LOANS", and the bottom card "BUSINESS CREDIT". Each card has a small upward-pointing arrow that fades in beside it, one after another from top to bottom. A narrator says, "Higher borrowing costs mean households buy less and companies invest less, which slows economic activity."',
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'A wide river flowing gently through a valley with grassy banks and distant hills under soft daylight. The water moves slowly and smoothly. The camera drifts laterally along the bank, following the calm current. Muted earth tones, soft daylight, calm and informative mood. A narrator says, "Over months, slower spending eases demand for goods and labor, and that helps bring inflation down."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 8,
					videoPrompt:
						"A large grey concrete dam with three vertical steel sluice gates set into its face stands across a valley. A worker in a navy jacket and white hard hat, seen from behind, stands on the dam's walkway and looks out over the valley. The camera slowly pulls back, revealing more of the valley and sky. Muted earth tones, soft daylight, calm and informative mood. A narrator says, \"Without the full article, we don't know why the Fed acted now or what it plans next. That guidance shapes how markets react.\"",
				},
			],
		}),
	},
	{
		label: "Retail sales surge the most since March",
		prompt:
			"Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
		poster: "/examples/retail.jpg",
		invocation: example("example-retail", "/examples/retail.mp4?v=full", {
			analysis:
				"Retail sales rose sharply last month, the largest monthly gain since March. The article does not state the exact percentage increase or the current month, so those facts are unknown. Strong retail sales indicate consumers are still spending, which supports economic growth and suggests the economy is not slowing quickly. This matters for markets because central banks watch consumer spending to decide whether to cut interest rates: if people keep spending, inflation may stay elevated, reducing the urgency for rate cuts. Bond yields could rise on the news if investors expect rates to stay higher for longer, while stocks might react positively to growth signals or negatively to fears of delayed rate cuts. The strength of this signal depends on whether the increase was driven by higher prices (people paying more for the same goods) or higher volumes (people buying more), and whether it continues in coming months. Without the exact figure or breakdown, the magnitude of market impact is uncertain.",
			metaphor:
				"a river flowing through a landscape, representing the flow of consumer spending through the economy",
			recurringElements: [
				"a wide river with clear blue water flowing steadily from left to right",
				"a landscape with green fields on both banks of the river",
			],
			look: "cinematic",
			styleBible:
				"35mm film aesthetic, shallow depth of field, natural daylight with soft shadows, muted earth tones with touches of green and blue",
			title: "Retail sales surge: what it means for markets",
			takeaway:
				"Strong consumer spending supports growth but may delay interest rate cuts if it keeps inflation elevated.",
			totalSeconds: 33,
			followUps: [
				"Why do rate cuts matter for stock prices?",
				"How do central banks decide when to cut rates?",
				"What would make consumer spending slow down?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A wide river with clear blue water flowing steadily from left to right through a landscape with green fields on both banks of the river. The current surges visibly faster, white foam appearing on the surface as the volume of water increases. Camera pans slowly along the river from an elevated angle. Natural daylight with soft shadows. A narrator says, "Retail sales jumped last month by the most since March, showing consumers are still spending at a strong pace."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'A wide river with clear blue water flowing steadily from left to right past green fields, then splitting into multiple smaller streams that branch out across the landscape with green fields on both banks of the river. Each stream flows toward different areas: factories, office buildings, and warehouses in the distance. Camera follows one branch as it winds toward a cluster of buildings. Natural daylight with soft shadows. A narrator says, "When people spend more, that money flows through the economy to businesses, supporting jobs and growth."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A central bank building made of grey stone with tall columns sits beside a wide river with clear blue water flowing steadily from left to right. A set of three large wooden sluice gates stands at the river\'s edge near the building. The gates remain closed as the river current pushes against them. Camera slowly circles the building and gates. Natural daylight with soft shadows. A narrator says, "Central banks watch consumer spending closely because it drives inflation, which determines when they cut interest rates."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 5,
					videoPrompt:
						'Three cards arranged horizontally. The left card labeled "BONDS" tilts downward. The middle card labeled "STOCKS" wobbles slightly side to side. The right card labeled "DOLLAR" tilts upward. A narrator says, "Strong spending could push bond prices down and the dollar up if rate cuts are delayed."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A wide river with clear blue water flowing steadily from left to right through a landscape with green fields on both banks of the river. Overhead view looking down at the surface. The current appears strong but the water level itself is ambiguous, making it unclear whether the surge is from greater volume or just faster flow. Camera holds steady on the river surface. Natural daylight with soft shadows. A narrator says, "The key question is whether people are buying more goods or just paying higher prices for the same amount."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'A wide river with clear blue water flowing steadily from left to right through a landscape with green fields on both banks of the river. Camera positioned low at the water\'s edge, looking downstream toward a bend in the river that disappears into morning mist. The future path of the river is obscured. Natural daylight with soft shadows. A narrator says, "One strong month does not make a trend, so markets will watch whether spending stays elevated."',
				},
			],
		}),
	},
	{
		label: "EU floats associate membership for Canada",
		prompt:
			"EU chief floats associate membership for Canada after U.S. trade attacks",
		poster: "/examples/eu-canada.jpg",
		invocation: example("example-eu-canada", "/examples/eu-canada.mp4?v=full", {
			analysis:
				"The EU is exploring a closer trade relationship with Canada, potentially through associate membership, in response to U.S. trade tensions. This signals a defensive realignment: if the U.S. imposes tariffs or other trade barriers, the EU and Canada may deepen ties to preserve market access and reduce dependence on American trade. For markets, this means potential shifts in trade flows, currency pairs (EUR/CAD could strengthen if a deal materializes), and sectors exposed to transatlantic trade. European exporters facing U.S. tariffs might redirect to Canada; Canadian firms could gain easier access to the EU's single market. The timeline is uncertain—associate membership would require negotiations and approvals—so immediate market impact is likely muted. The key risk: if U.S.-EU or U.S.-Canada tensions ease, the urgency for this partnership fades. Watch for concrete proposals and whether other countries (UK, Australia) seek similar arrangements, which could fragment global trade into regional blocs.",
			metaphor:
				"a suspension bridge with three towers (U.S., EU, Canada), where the EU-Canada span is being reinforced with new cables as the U.S. connections fray",
			recurringElements: [
				"a large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced",
				"thick steel cables running between the towers, some bright and taut, others rusted and sagging",
				"a construction crew in orange safety vests and white hard hats, seen from behind or at a distance, working on the bridge deck",
			],
			look: "cinematic",
			styleBible:
				"35mm film aesthetic, shallow depth of field, cool blue-grey color palette with warm orange accents from safety equipment, overcast daylight with soft diffused shadows, industrial realism",
			title: "EU and Canada eye closer ties amid U.S. trade tensions",
			takeaway:
				"Trade conflicts can push countries to form new partnerships, reshaping which markets and currencies benefit from cross-border flows.",
			totalSeconds: 43,
			followUps: [
				"What is associate membership and how does it differ from full EU membership?",
				"Which sectors would benefit most from stronger EU-Canada trade?",
				"How do tariffs change where companies sell their goods?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced. Thick steel cables running between the towers, some bright and taut, others rusted and sagging. The camera slowly pans from left to right, revealing the full span of the bridge under an overcast sky. A narrator says, "The EU is exploring closer trade ties with Canada as tensions with the U.S. threaten existing partnerships."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'A large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced. Thick steel cables running between the towers, some bright and taut, others rusted and sagging. Focus on the left span connecting the U.S. tower to the EU tower, where cables are visibly frayed and sagging. The camera tilts down to show a small gap opening in the bridge deck. A narrator says, "When the U.S. imposes tariffs or trade barriers, it weakens the connections that allow goods to flow freely between these economies."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced. A construction crew in orange safety vests and white hard hats, seen from behind or at a distance, working on the bridge deck. The crew is installing new bright steel cables on the right span, connecting the EU tower to the Canada tower. The camera follows the crew as they move along the deck, tightening cables. A narrator says, "By deepening ties with Canada, the EU creates an alternative route for trade, reducing reliance on the American market."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 6,
					videoPrompt:
						'Three rectangular cards arranged horizontally, labeled "EU EXPORTERS", "CANADIAN FIRMS", and "U.S. TRADE". An upward arrow appears above the first two cards simultaneously, while a downward arrow appears above the third card. The arrows animate in sequence, rising and falling with a smooth motion. A narrator says, "European exporters and Canadian firms could benefit from easier market access, while U.S. trade flows may shrink."',
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'A wide river flowing beneath a large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced. The camera is positioned low, looking up at the bridge from the water\'s surface. Small cargo ships are visible beneath the right span, moving from the EU tower toward the Canada tower, while the left span is empty. A narrator says, "Trade flows shift toward the strengthened route, and the euro and Canadian dollar could gain if a formal agreement takes shape."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						'A large steel suspension bridge stretching across a wide river, with three tall concrete towers rising from the water, evenly spaced. A construction crew in orange safety vests and white hard hats, seen from behind or at a distance, working on the bridge deck. The crew pauses mid-task, tools resting on the deck, as the camera slowly pulls back to reveal fog rolling in from the horizon, obscuring the towers. A narrator says, "But this takes time. Negotiations and approvals could drag on, and if U.S. tensions ease, the urgency for a new partnership fades. Watch for concrete proposals and whether other countries seek similar deals."',
				},
			],
		}),
	},
	{
		label: "Why companies won't pause on AI (WSJ)",
		prompt:
			"https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
		poster: "/examples/ai-pause.jpg",
		invocation: example("example-ai-pause", "/examples/ai-pause.mp4?v=full", {
			analysis:
				"The headline suggests companies will continue investing in AI despite potential headwinds such as economic uncertainty, high costs, or unclear returns. Without the article text, the specific reasoning is unknown, but the general mechanism is clear: firms perceive AI as competitively necessary rather than optional, meaning investment continues even when immediate ROI is uncertain. This matters for markets because sustained corporate AI spending supports demand for semiconductors, cloud infrastructure, data centers, and energy. It also means capital allocation stays tilted toward technology and away from other uses, which affects valuations in tech versus traditional sectors. The bullish view is that this creates a durable growth story for AI-related equities. The bearish counter is that if returns fail to materialize, the spending becomes a sunk cost and valuations correct sharply. What would prove this view wrong: a wave of project cancellations or a shift in corporate guidance toward cost discipline over AI ambition. The key uncertainty is whether the productivity gains justify the capital outlay, which will only become clear over the next several quarters as deployments mature.",
			metaphor:
				"a construction site where a large foundation is being poured and reinforced, even as weather threatens",
			recurringElements: [
				"a wide construction site with a large rectangular concrete foundation being poured, steel rebar grid visible, wet concrete being leveled",
				"a construction worker in an orange safety vest and yellow hard hat, seen from behind",
				"a concrete mixer truck, grey drum rotating, parked at the edge of the site",
			],
			look: "cinematic",
			styleBible:
				"35mm film stock, wide-angle lens, desaturated color palette with muted greys and burnt orange, overcast natural light with soft shadows, industrial documentary aesthetic",
			title: "Why companies keep spending on AI",
			takeaway:
				"Firms treat AI as a competitive necessity, so spending continues even when returns are uncertain, sustaining demand for chips and infrastructure.",
			totalSeconds: 32,
			followUps: [
				"Which sectors benefit most from corporate AI spending?",
				"What would make companies cut AI budgets?",
				"How do you measure AI productivity gains?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'a wide construction site with a large rectangular concrete foundation being poured, steel rebar grid visible, wet concrete being leveled. A construction worker in an orange safety vest and yellow hard hat, seen from behind, stands at the edge supervising. A concrete mixer truck, grey drum rotating, parked at the edge of the site. Dark clouds gather overhead but the pour continues. Camera slowly pushes in toward the worker. Overcast natural light, desaturated greys and burnt orange. A narrator says, "Companies are unlikely to hit pause on AI spending, even as costs mount and returns stay uncertain."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'a wide construction site with a large rectangular concrete foundation being poured, steel rebar grid visible, wet concrete being leveled. A construction worker in an orange safety vest and yellow hard hat, seen from behind, gestures to crew members off-screen. A concrete mixer truck, grey drum rotating, parked at the edge of the site, continues to pour. Rain begins to fall lightly but the work does not stop. Camera pans slowly across the site. Overcast natural light, muted greys and burnt orange. A narrator says, "Firms see AI as competitively necessary, not optional. Stopping the build means falling behind, so the foundation keeps getting poured."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 6,
					videoPrompt:
						'Three rectangular cards arranged in a row. The first card is labeled "CHIPS", the second "CLOUD", the third "ENERGY". All three cards rise upward together in a smooth motion. Simple flat design, cards in muted tones with uppercase sans-serif labels. A narrator says, "That spending flows to semiconductors, cloud services, and the data centers and power grids that run them."',
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'a wide construction site with a large rectangular concrete foundation being poured, steel rebar grid visible, wet concrete being leveled. A second, smaller plot of land beside the main site sits empty, overgrown with weeds, no activity. Camera tilts from the active foundation to the neglected plot. Overcast natural light, desaturated palette. A narrator says, "Capital goes to AI, which means it does not go elsewhere, shifting valuations toward technology and away from other sectors."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'a wide construction site with a large rectangular concrete foundation being poured, steel rebar grid visible, wet concrete being leveled. A construction worker in an orange safety vest and yellow hard hat, seen from behind, crouches and places a hand on the wet concrete, testing its set. Rain falls more steadily now. Camera holds on the worker\'s silhouette. Overcast light, muted greys and orange. A narrator says, "The risk is simple: if the productivity does not show up, the spending becomes a sunk cost."',
				},
			],
		}),
	},
];
