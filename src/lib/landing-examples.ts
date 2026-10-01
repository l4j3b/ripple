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
		poster: "/examples/fed.jpg?v=2",
		invocation: example("example-fed", "/examples/fed.mp4?v=2", {
			analysis:
				"The Federal Reserve has raised interest rates by 0.25 percentage points, marking the first policy move under a new Fed chair (Warsh). This reverses the recent easing cycle and signals concern about economic overheating or inflation. A rate hike makes borrowing more expensive across the economy: mortgages, business loans, and credit cards all become costlier. This typically slows consumer spending and business investment, cooling demand. Bonds sell off because their fixed payments are worth less when new bonds offer higher yields, and the dollar strengthens as higher rates attract foreign capital. Stocks often fall, especially growth stocks whose distant future earnings are discounted more steeply at higher rates. The timing matters: if this comes after months of cuts, it suggests the Fed misjudged how much easing the economy needed, or new data forced a reversal. The key uncertainty is whether this is a one-time correction or the start of a tightening cycle. If inflation proves stubborn or growth stays strong, more hikes could follow. If data weakens, the Fed could pause or even cut again. The user provided only a headline with no article text, so details like the reason for the hike, the vote breakdown, and forward guidance are unknown.",
			metaphor:
				"a large valve on a pipeline being turned clockwise to restrict the flow of water",
			recurringElements: [
				"a large steel valve wheel with six spokes, weathered grey metal, mounted on a thick industrial pipeline",
				"a gloved hand gripping one spoke of the valve wheel, turning it clockwise",
				"a concrete pipeline painted industrial grey, two meters in diameter, stretching into the distance",
			],
			look: "cinematic",
			styleBible:
				"35mm film stock, shallow depth of field, cool desaturated palette with grey concrete and steel, overcast daylight with soft shadows, industrial and utilitarian",
			title: "Fed raises rates for the first time under new leadership",
			takeaway:
				"The Fed's quarter-point rate hike makes borrowing more expensive, slowing spending and investment while strengthening the dollar and pressuring stocks and bonds.",
			totalSeconds: 32,
			followUps: [
				"Why would the Fed raise rates after cutting them?",
				"How does a rate hike affect mortgage payments?",
				"What happens to the dollar when rates go up?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'a gloved hand gripping one spoke of the valve wheel, turning it clockwise begins turning the large steel valve wheel with six spokes, weathered grey metal, mounted on a thick industrial pipeline clockwise, tightening it by a quarter turn. The concrete pipeline painted industrial grey, two meters in diameter, stretching into the distance sits against an overcast sky. The camera holds steady on the valve from a low angle. Sound: metallic creaking and the distant hum of machinery. A narrator says, "The Federal Reserve just raised interest rates by a quarter point, the first move under new Fed leadership, reversing months of rate cuts."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'[0-5 seconds] Water flowing through the concrete pipeline painted industrial grey, two meters in diameter, stretching into the distance visibly slows as the large steel valve wheel with six spokes, weathered grey metal, mounted on a thick industrial pipeline restricts the opening. [5-12 seconds] The flow continues to narrow, the stream thinning inside the pipe. The camera tracks alongside the pipeline at walking pace. Sound: rushing water fading to a slower trickle. A narrator says, "A rate hike makes borrowing more expensive, so money flows more slowly through the economy as households and businesses pull back on loans."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 8,
					videoPrompt:
						'Sound: subtle whoosh as cards appear. A narrator says, "Bond prices fall because their fixed payments lose value when new bonds offer higher rates, and the dollar strengthens as higher rates pull in foreign money."',
					diagram: {
						type: "cards",
						cards: [
							{
								label: "BOND PRICES",
								direction: "down",
							},
							{
								label: "THE DOLLAR",
								direction: "up",
							},
						],
					},
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'The large steel valve wheel with six spokes, weathered grey metal, mounted on a thick industrial pipeline now turned tighter, with the concrete pipeline painted industrial grey, two meters in diameter, stretching into the distance carrying only a thin stream of water. The overcast sky grows darker. The camera tilts up from the valve to the grey clouds. Sound: wind and distant industrial hum. A narrator says, "Stocks typically drop, especially growth companies whose future earnings are worth less when rates are higher."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'a gloved hand gripping one spoke of the valve wheel, turning it clockwise rests on the large steel valve wheel with six spokes, weathered grey metal, mounted on a thick industrial pipeline, still. The concrete pipeline painted industrial grey, two meters in diameter, stretching into the distance fades into mist. The camera slowly pulls back. Sound: quiet wind and faint dripping water. A narrator says, "The big question is whether this is a one-time move or the start of more hikes to come."',
				},
			],
		}),
	},
	{
		label: "Retail sales surge the most since March",
		prompt:
			"Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
		poster: "/examples/retail.jpg?v=2",
		invocation: example("example-retail", "/examples/retail.mp4?v=2", {
			analysis:
				"Retail sales surged last month by the most since March 2026. That March spike was driven by higher gasoline prices and tax refund timing, not underlying demand strength. This latest surge suggests consumer spending remains robust even without those temporary boosts. Strong consumption supports corporate revenues and employment, which reduces recession risk and tends to lift equities. The main competing view is that the surge reflects inflation or pulled-forward purchases rather than sustained demand growth. What would make this view wrong: if the next month's data shows a sharp reversal, indicating the surge was one-time rather than a trend shift.",
			metaphor:
				"a wide river flowing steadily through a landscape, representing consumer spending moving through the economy",
			recurringElements: [
				"a wide river with clear blue-green water flowing steadily from left to right across the frame",
				"a patchwork landscape of green fields and brown industrial areas along both riverbanks",
			],
			look: "cinematic",
			styleBible:
				"35mm photographic style with natural color grading, cool blue-greens in the water and warm earth tones in the landscape, soft overcast daylight creating even illumination, shallow depth of field isolating the river in the foreground",
			title: "Retail sales surge in September as consumers keep spending",
			takeaway:
				"Strong consumer spending reduces recession risk and supports stocks when it reflects genuine demand rather than temporary price spikes.",
			totalSeconds: 32,
			followUps: [
				"Why do tax refunds boost spending temporarily?",
				"How do retailers respond when sales surge unexpectedly?",
				"What happens if next month's sales drop sharply?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 8,
					videoPrompt:
						'A wide river with clear blue-green water flowing steadily from left to right across the frame, moving through a patchwork landscape of green fields and brown industrial areas along both riverbanks. The river is wide and full, its surface rippling with strong current. The camera glides slowly alongside the river at a low angle, following the flow. Soft overcast daylight creates even illumination. Sound: gentle rushing water and distant wind. A narrator says, "Retail sales surged last month by the most since March, signaling that consumers are still spending even without help from gas price spikes or tax refunds."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'[0-6 seconds] A wide river with clear blue-green water flowing steadily from left to right across the frame, moving through a patchwork landscape of green fields and brown industrial areas along both riverbanks. The water spreads outward, fanning into shallow channels that reach the fields and industrial areas on both banks. [6-12 seconds] The channels continue spreading, reaching deeper into the landscape as the river feeds more territory. The camera pulls back slowly to reveal the branching network of water. Soft overcast daylight creates even illumination. Sound: water flowing over smooth stones. A narrator says, "When shoppers spend more, that money flows to businesses as revenue, which supports hiring and investment across the economy."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 5,
					videoPrompt:
						'Sound: soft upward whoosh. A narrator says, "Strong spending supports business revenues and jobs, which lifts stocks and eases fears of a recession."',
					diagram: {
						type: "cards",
						cards: [
							{
								label: "STOCKS",
								direction: "up",
							},
							{
								label: "RECESSION RISK",
								direction: "down",
							},
						],
					},
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'A wide river with clear blue-green water flowing steadily from left to right across the frame. The surface suddenly roils with whitecaps and choppy waves, the water level appearing slightly higher but turbulent. The camera holds steady at eye level with the river. Soft overcast daylight creates even illumination. Sound: water splashing and gurgling over rocks. A narrator says, "The question is whether the surge reflects genuine demand or just temporary factors like higher prices or shoppers buying earlier than usual."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'A wide river with clear blue-green water flowing steadily from left to right across the frame, moving through a patchwork landscape of green fields and brown industrial areas along both riverbanks. The camera slowly pushes forward along the river, following its path into the distance where it curves out of sight. Soft overcast daylight creates even illumination. Sound: steady flowing water fading into the distance. A narrator says, "Next month\'s data will show whether this surge marks a lasting shift or a one-time spike that reverses quickly."',
				},
			],
		}),
	},
	{
		label: "EU floats associate membership for Canada",
		prompt:
			"EU chief floats associate membership for Canada after U.S. trade attacks",
		poster: "/examples/eu-canada.jpg?v=2",
		invocation: example("example-eu-canada", "/examples/eu-canada.mp4?v=2", {
			analysis:
				'The headline suggests the EU is considering some form of associate membership for Canada, apparently in response to U.S. trade attacks. Without the article text, I cannot determine what "trade attacks" means, when they occurred, what associate membership would entail, or who in the EU proposed this. The market implications depend entirely on those details: whether this is a formal trade pact, a political signal, or exploratory talk, and whether it would lower tariffs, create regulatory alignment, or simply coordinate against U.S. measures. Associate membership could strengthen the euro and Canadian dollar if it deepens trade ties, but the impact on equities, bonds, and commodities depends on which sectors gain market access and what reciprocal obligations Canada accepts. The strongest competing view is that this is a rhetorical response with no near-term trade effect. I cannot analyze transmission chains, affected assets, or timeframes without knowing what was actually proposed and under what circumstances.',
			metaphor:
				"two harbors, one representing the EU and one representing Canada, with a new shipping lane opening between them while a third harbor (the U.S.) imposes barriers",
			recurringElements: [
				"a large European harbor with grey stone quays and red-roofed warehouses, viewed from the water",
				"a Canadian harbor with wooden piers and dark green forested hills behind it, viewed from the water",
				"a U.S. harbor with tall modern cranes and blue shipping containers stacked high, viewed from the water",
				"container ships in red, white, and blue livery moving between the harbors",
			],
			look: "cinematic",
			styleBible:
				"Wide-angle documentary photography, 35mm film grain, desaturated coastal palette of grey stone, deep blue water, and muted reds and greens, soft overcast daylight",
			title:
				"EU floats associate membership for Canada after U.S. trade attacks",
			takeaway:
				"The EU is exploring closer ties with Canada in response to U.S. trade measures, but the article details needed to assess market impact are unavailable.",
			totalSeconds: 23,
			followUps: [
				"What is EU associate membership?",
				"How would this affect the Canadian dollar?",
				"What U.S. trade measures prompted this?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'a large European harbor with grey stone quays and red-roofed warehouses, viewed from the water and a Canadian harbor with wooden piers and dark green forested hills behind it, viewed from the water, separated by open water. A single container ship in red, white, and blue livery begins moving from the European harbor toward the Canadian harbor, leaving a white wake. Wide shot from above the water, camera slowly panning right to follow the ship. Soft overcast daylight. Sound: distant foghorn and gentle water lapping. A narrator says, "The EU is floating the idea of associate membership for Canada, a response to recent U.S. trade attacks."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'[0-6 seconds] a U.S. harbor with tall modern cranes and blue shipping containers stacked high, viewed from the water. Steel barriers rise at the mouth of the harbor, blocking entry. [6-12 seconds] Container ships in red, white, and blue livery that were heading toward the U.S. harbor turn away and begin moving toward the open water between the European and Canadian harbors. Wide shot from the side, camera slowly pulling back. Soft overcast daylight. Sound: low metallic clang as barriers rise, then quiet engine hum. A narrator says, "The headline refers to U.S. trade attacks, but the article itself could not be retrieved, so the specifics are unknown."',
				},
				{
					beat: "uncertainty",
					visual: "graphic",
					durationSeconds: 5,
					videoPrompt:
						'Sound: soft whoosh as elements appear. A narrator says, "Without knowing what was proposed or what prompted it, we cannot assess how markets would react."',
					diagram: {
						type: "cards",
						cards: [
							{
								label: "TRADE TERMS",
								direction: "flat",
							},
							{
								label: "CURRENCY IMPACT",
								direction: "flat",
							},
							{
								label: "SECTOR EFFECTS",
								direction: "flat",
							},
						],
					},
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'a new wide shipping lane marked by floating buoys opening between a large European harbor with grey stone quays and red-roofed warehouses, viewed from the water and a Canadian harbor with wooden piers and dark green forested hills behind it, viewed from the water. Container ships in red, white, and blue livery are visible in the distance but not yet entering the lane. The water is calm. Wide shot from above, camera slowly descending toward the water. Soft overcast daylight. Sound: quiet water and distant seabirds. A narrator says, "If this becomes a formal pact lowering trade barriers, it could strengthen ties and currencies, but for now it is only a proposal."',
				},
			],
		}),
	},
	{
		label: "Why companies won't pause on AI (WSJ)",
		prompt:
			"https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
		poster: "/examples/ai-pause.jpg?v=2",
		invocation: example("example-ai-pause", "/examples/ai-pause.mp4?v=2", {
			analysis:
				"The headline states that companies are unlikely to pause AI investments. The full article could not be read, so the mechanism must be inferred from general market dynamics. Companies continue AI spending because they see it as a competitive necessity: stopping would mean falling behind rivals who keep building. This creates a prisoner's dilemma where no firm can afford to be the one that stops, even if returns are uncertain. For markets, this means sustained demand for AI infrastructure (chips, cloud services, data centers) and continued capex from tech firms and enterprises. Winners are semiconductor companies, cloud providers, and AI software firms. Losers are firms that underinvest and lose market share, or those overextended on AI bets that fail to pay off. The risk is that collective overspending leads to a correction if returns disappoint, but the coordination problem makes a voluntary pause unlikely. The competing view is that companies will slow spending as capital discipline returns, especially if interest rates stay high or earnings pressure mounts. This view would be wrong if competitive pressure remains stronger than financial discipline, which the headline suggests is the case.",
			metaphor:
				"a construction site where multiple buildings rise side by side, each builder racing to finish first",
			recurringElements: [
				"a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible",
				"construction workers in yellow hard hats and orange vests, seen from behind or at a distance, moving quickly between floors",
			],
			look: "cinematic",
			styleBible:
				"Documentary realism, shot on 35mm film with a 50mm lens, natural daylight with soft shadows, color palette of steel grays, construction oranges, and concrete whites, slightly desaturated for a neutral informative tone",
			title: "Why companies won't pause AI spending",
			takeaway:
				"Companies keep investing in AI because stopping would mean falling behind competitors who continue building.",
			totalSeconds: 40,
			followUps: [
				"What happens if AI spending doesn't pay off?",
				"Which companies benefit most from this AI arms race?",
				"Could high interest rates force companies to slow down?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible. Construction workers in yellow hard hats and orange vests, seen from behind or at a distance, moving quickly between floors. Camera slowly pulls back to reveal the scale of all three towers. Sound: rhythmic hammering and distant crane motors. A narrator says, "Companies are not slowing down their AI investments, even as costs pile up and returns remain uncertain."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 5,
					videoPrompt:
						'a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible. [0-6 seconds] One tower\'s construction visibly slows, with fewer construction workers in yellow hard hats and orange vests, seen from behind or at a distance, and cranes standing still. [6-12 seconds] The other two towers continue rising rapidly, their cranes lifting new beams into place. Camera pans from the slower tower to the faster ones. Sound: hammering fades on one side, intensifies on the other. A narrator says, "The reason is competitive pressure. If one company slows down, its rivals keep building, and the gap widens."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible. The slowest tower now visibly shorter than the others. Construction workers in yellow hard hats and orange vests, seen from behind or at a distance, look up from the lower tower toward the taller ones. Camera tilts up to emphasize the height difference. Sound: wind whistling through the steel frames. A narrator says, "No firm can afford to be the one that stops, creating a kind of arms race where everyone keeps spending."',
				},
				{
					beat: "impact",
					visual: "graphic",
					durationSeconds: 6,
					videoPrompt:
						'Sound: soft upward whoosh as cards appear. A narrator says, "This means sustained demand for AI chips, cloud services, and data centers, all of which continue to see strong investment."',
					diagram: {
						type: "cards",
						cards: [
							{
								label: "AI CHIPS",
								direction: "up",
							},
							{
								label: "CLOUD SERVICES",
								direction: "up",
							},
							{
								label: "DATA CENTERS",
								direction: "up",
							},
						],
					},
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 7,
					videoPrompt:
						'a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible. [0-6 seconds] Delivery trucks arrive at the base of each tower, unloading steel beams and materials. [6-12 seconds] Construction workers in yellow hard hats and orange vests, seen from behind or at a distance, carry the materials up into the towers. Camera follows the flow of materials from trucks to towers. Sound: truck engines and metal clanging. A narrator says, "Semiconductor companies, cloud providers, and AI software firms all benefit. Firms that underinvest risk losing market share to those that keep building."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 6,
					videoPrompt:
						'a construction site with three identical steel-frame towers rising side by side, each at a different stage of completion, scaffolding and cranes visible. The towers now very tall, with cranes still lifting beams, but the ground below is cluttered with unused materials and cost overruns visible in the sprawl. Camera slowly tilts down from the tops of the towers to the cluttered ground. Sound: wind and distant hammering, slightly ominous. A narrator says, "The risk is that collective overspending leads to a correction if the returns on all this investment fail to materialize."',
				},
				{
					beat: "uncertainty",
					visual: "graphic",
					durationSeconds: 5,
					videoPrompt:
						'Sound: subtle downward tone as gauge needle moves. A narrator says, "Watch for signs of capital discipline returning, especially if earnings pressure mounts or financing costs stay high."',
					diagram: {
						type: "gauge",
						label: "SPENDING DISCIPLINE",
						direction: "down",
					},
				},
			],
		}),
	},
];
