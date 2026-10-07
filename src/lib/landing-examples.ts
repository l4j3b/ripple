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
		poster: "/examples/fed.jpg?v=3",
		invocation: example("example-fed", "/examples/fed.mp4?v=3", {
			analysis:
				"The Fed raised its key interest rate by a quarter point, and the headline calls it the first move of the 'Warsh era'. Only the headline was provided, so the reasons for the move, the vote, any forward guidance and the market reaction are unknown. The usual chain is: a higher policy rate makes bank lending costlier, which pushes up mortgage, car loan and business borrowing costs and tends to cool spending and price increases. Savers and holders of cash-like accounts tend to gain, while borrowers, especially those with adjustable-rate debt, and rate-sensitive sectors like housing lose, mostly over the coming months. Stock and bond prices can adjust because future profits are worth less when money costs more. The strongest competing view is that a quarter point is small and may already have been expected, so the real market driver is the Fed's signal about what comes next. This view would be wrong if the move surprised traders or came with unexpectedly firm guidance, in which case the reaction could be larger.",
			metaphor:
				"A concrete dam whose sluice gates are lowered slightly, narrowing the flow of water the way a rate hike narrows the flow of borrowed money.",
			recurringElements: [
				"a grey concrete dam with three steel sluice gates, water pouring through the gap beneath each gate into a wide river channel",
			],
			look: "cinematic",
			styleBible:
				"Photographic cinematic footage, shot on a full-frame camera with a 35mm lens and subtle film grain. Muted palette of slate grey, steel blue and soft green with warm highlights. Soft natural overcast daylight, calm and measured mood, shallow depth of field where people appear.",
			title: "What a quarter-point Fed rate hike means",
			takeaway:
				"A quarter-point rate hike narrows the flow of cheap borrowing, and what the Fed signals next may matter more than the move itself.",
			totalSeconds: 56,
			followUps: [
				"How does a Fed rate hike affect mortgage rates?",
				"Why do higher rates push bond prices down?",
				"What is forward guidance and why do markets watch it?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 12,
					videoPrompt:
						'A grey concrete dam with three steel sluice gates, water pouring through the gap beneath each gate into a wide river channel. [0-6 seconds] The middle gate lowers by a small step. [6-12 seconds] The stream beneath that gate thins while the other two keep flowing. The camera holds a steady wide shot from the riverbank. Soft overcast daylight. Sound: rushing water and a low mechanical groan of the gate. A narrator says, "The Fed raised its key interest rate by a quarter point, the first move of what the headline calls the Warsh era. It is a small step, but it makes borrowing money a little more expensive across the economy."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 12,
					videoPrompt:
						'A grey concrete dam with three steel sluice gates, water pouring through the gap beneath each gate into a wide river channel. [0-6 seconds] All three gates lower together, narrowing each gap. [6-12 seconds] The water spilling into the channel below slows to a thinner, calmer stream. The camera slowly pushes in from the downstream side. Soft overcast daylight. Sound: rushing water easing to a gentler trickle. A narrator says, "Think of the rate as a set of gates on a dam: raising it narrows the gates, so less borrowed money flows to mortgages, car loans and business investment. Slower flow cools spending and, over time, price increases."',
				},
				{
					beat: "mechanism",
					visual: "graphic",
					durationSeconds: 9,
					videoPrompt:
						'Sound: a soft whoosh as each step appears. A narrator says, "In short, a higher rate makes loans costlier, which gives households and firms a reason to spend less. That is the usual way the Fed tries to slow price increases."',
					diagram: {
						type: "chain",
						steps: ["RATE HIKE", "COSTLIER LOANS", "SLOWER SPENDING"],
					},
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						'A couple in plain jackets, seen from behind, carry a plain cardboard box up the front path of a two-storey brick house on a quiet suburban street. [0-5 seconds] They walk up the path past a small front garden. [5-11 seconds] They continue toward the front door of the house. The camera tracks slowly behind them at walking pace. Soft overcast daylight. Sound: footsteps on pavement and distant birdsong. A narrator says, "Savers can earn a bit more, while borrowers such as home buyers and companies with adjustable loans face higher costs. Stocks and bonds often adjust too, since future profits are worth less when money costs more."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 12,
					videoPrompt:
						'A grey concrete dam with three steel sluice gates, water pouring through the gap beneath each gate into a wide river channel. [0-6 seconds] Seen from downstream, the water keeps flowing steadily through all three gaps, the middle gap slightly narrower. [6-12 seconds] The camera slowly pulls back to reveal the whole dam and the river stretching beyond it. Soft overcast daylight with a thin mist over the water. Sound: steady rushing water and distant wind. A narrator says, "We only have the headline, so the reasons for the move and any signal about future hikes are unknown. Markets may have expected a quarter point already, which would make the Fed\'s next hint matter more than the move."',
				},
			],
		}),
	},
	{
		label: "Retail sales surge the most since March",
		prompt:
			"Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
		poster: "/examples/retail.jpg?v=3",
		invocation: example("example-retail", "/examples/retail.mp4?v=3", {
			analysis:
				"The excerpt says retail sales, the total spent in stores and online, rose last month by the most since March. It gives no figure for the jump, and it does not say what drove last month's increase. It says only that March's surge was helped by a spike in gasoline prices and a boost from tax refunds. The mechanism is that retail sales are measured in dollars, so a total can rise because people buy more, because things cost more, or because households have extra cash such as refunds. Consumer spending is a large part of the economy, so a strong reading can support growth and company sales. It could also keep price pressure alive and make central banks more cautious about cutting rates, though that is a likely effect and not a certainty. The strongest competing reading is that the jump is mostly a price effect and not real demand. That view would be wrong if sales excluding gasoline, adjusted for inflation, also rose strongly. Those breakdowns are not in the text provided, so the quality of the surge is unknown.",
			metaphor:
				"A stream turning a mill wheel: the faster the water, the faster the wheel, but a swollen stream can hide whether there is more water or just a surge.",
			recurringElements: [],
			look: "cinematic",
			styleBible:
				"Photographic cinematic footage, 35mm film feel, shallow depth of field, natural muted palette of warm stone, weathered wood and cool green-blue water, soft overcast daylight with gentle highlights, calm and unhurried mood.",
			title: "Retail sales jump: real demand or higher prices?",
			takeaway:
				"A big jump in retail sales is only half the story until you know whether people bought more or things just cost more.",
			totalSeconds: 50,
			followUps: [
				"What is the difference between nominal and real retail sales?",
				"Why do central banks watch consumer spending?",
				"How do gasoline prices affect inflation readings?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 9,
					videoPrompt:
						'A weathered wooden water wheel on an old grey stone mill turns faster as a stream rushes against its paddles, spray flying off the boards. The camera holds a steady medium shot from the bank. Soft overcast daylight. Sound: rushing water and the creak of turning wood. A narrator says, "Retail sales, the total spent in stores and online, surged last month by the most since March. It is a quick read on whether shoppers are still driving the economy."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						"[0-5 seconds] A silver sedan pulls up beside a fuel pump at a quiet station, seen from behind, the pump's display side facing away from the camera. [5-11 seconds] A hand slides the nozzle into the car's fuel inlet and squeezes the handle as the car sits at the pump. The camera makes a slow push-in from behind the car. Soft overcast daylight. Sound: idling engine and the click and hum of a fuel pump. A narrator says, \"We have no figure for the jump, so its size is unknown. What we do know is that March's surge was helped by a spike in gasoline prices and a boost from tax refunds.\"",
				},
				{
					beat: "mechanism",
					visual: "graphic",
					durationSeconds: 9,
					videoPrompt:
						'Sound: a soft whoosh as each step appears. A narrator says, "When gasoline costs more, the same fill-up adds more dollars to the total. Tax refunds hand households extra cash to spend, which lifts the total in a different way."',
					diagram: {
						type: "chain",
						steps: [
							"HIGHER PRICES",
							"MORE DOLLARS SPENT",
							"BIGGER SALES TOTAL",
						],
					},
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 13,
					videoPrompt:
						'[0-6 seconds] A busy pedestrian shopping street with plain unmarked glass storefronts, shoppers carrying paper-free cloth bags walking away from the camera at a distance. [6-13 seconds] The crowd thickens as more shoppers stream along the same street and pass in and out of the shops. The camera tracks slowly forward at shoulder height. Soft warm afternoon light. Sound: footsteps, quiet chatter and distant traffic. A narrator says, "Consumer spending is a large part of the economy, so a strong reading can support growth. It can also keep prices rising and make central banks cautious about cutting interest rates, though that is a likely effect, not a certainty."',
				},
				{
					beat: "uncertainty",
					visual: "graphic",
					durationSeconds: 8,
					videoPrompt:
						'Sound: a soft whoosh as each step appears. A narrator says, "The headline total can mislead, because price jumps inflate it. A better test is sales excluding gasoline, adjusted for inflation, to see whether people truly bought more."',
					diagram: {
						type: "chain",
						steps: ["REMOVE GAS", "ADJUST FOR PRICES", "TRUE DEMAND"],
					},
				},
			],
		}),
	},
	{
		label: "EU floats associate membership for Canada",
		prompt:
			"EU chief floats associate membership for Canada after U.S. trade attacks",
		poster: "/examples/eu-canada.jpg?v=3",
		invocation: example("example-eu-canada", "/examples/eu-canada.mp4?v=3", {
			analysis:
				"Only the headline was available, so the rest of the reporting could not be read. The headline says the head of the European Union floated associate membership for Canada after trade attacks from the United States. The likely logic is that if those attacks are tariffs, which are taxes on imports, Canadian goods become pricier for American buyers, and Canada has more reason to diversify toward other large customers such as Europe. Canadian exporters and European companies could gain over years from easier access, while American sellers could lose ground in Canada. The strongest competing view is that this is mostly a political signal. A floated idea is not an offer, and the terms of associate status are unknown, so it may change little in practice. The view would be wrong if talks stall, if the status turns out to be mostly symbolic, or if the U.S. trade dispute is resolved. Markets would react to concrete terms and to Washington's response, not to the idea itself.",
			metaphor:
				"A highway border crossing where trucks queue at a lowered barrier on one lane, while a second lane's barrier opens toward a new road.",
			recurringElements: [
				"a line of plain white box trucks with no markings, seen from behind, on a wide grey highway",
				"a wide highway border checkpoint with a red and white striped barrier arm across the lane and a small grey booth",
			],
			look: "cinematic",
			styleBible:
				"Photographic cinematic footage, 35mm lens, subtle film grain, shallow depth of field, muted blue-grey and amber palette, soft overcast daylight with gentle warm highlights, calm and observational mood.",
			title: "Europe floats associate membership for Canada",
			takeaway:
				"An associate membership offer is only an idea so far, but it shows how trade pressure from one partner can push a country to seek closer ties elsewhere.",
			totalSeconds: 49,
			followUps: [
				"What are tariffs and who pays them?",
				"Why would countries diversify their trade partners?",
				"How do trade disputes affect stock markets?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						'A line of plain white box trucks with no markings, seen from behind, on a wide grey highway, waits at a wide highway border checkpoint with a red and white striped barrier arm across the lane and a small grey booth. [0-5 seconds] The trucks idle in a queue before the lowered barrier arm. [5-11 seconds] The last truck pulls out of the line and turns onto a side road leading away. The camera holds steady at a low angle behind the queue. Soft overcast daylight. Sound: low diesel engine idle and distant wind. A narrator says, "The head of the European Union has floated the idea of associate membership for Canada, following trade attacks from the United States. Only the headline was available, so the details of the offer are unknown."',
				},
				{
					beat: "mechanism",
					visual: "graphic",
					durationSeconds: 10,
					videoPrompt:
						'Sound: a soft whoosh as each step appears. A narrator says, "If those attacks are tariffs, meaning taxes on imports, Canadian goods get pricier for American buyers. That gives Canada a reason to seek other customers, and Europe is a large one."',
					diagram: {
						type: "chain",
						steps: ["U.S. TARIFFS", "COSTLIER EXPORTS", "NEW BUYERS"],
					},
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 9,
					videoPrompt:
						'A line of plain white box trucks with no markings, seen from behind, on a wide grey highway, approaches a second lane at a wide highway border checkpoint with a red and white striped barrier arm across the lane and a small grey booth, where the barrier arm slowly lifts partway and stops half raised. The camera slowly pushes forward at truck height. Soft overcast daylight. Sound: a mechanical hum of the barrier arm and quiet engines. A narrator says, "Associate membership can mean partial benefits, like easier trade access, without full membership. What it would include here is not stated, so it could be a little or a lot."',
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						'A tall dockside crane lifts a plain blue shipping container with no markings onto a large cargo ship at a busy container port. [0-5 seconds] The crane lifts the container from a stack of plain colored containers. [5-11 seconds] The container settles onto the ship\'s deck as the crane swings back. The camera slowly tracks sideways along the quay. Warm late-afternoon light through light haze. Sound: distant clanking of steel and gulls over water. A narrator says, "If a deal took shape, Canadian exporters could gain new buyers and European companies easier access to Canada. Over time, American sellers could lose ground in Canada, though that would take years, not days."',
				},
				{
					beat: "uncertainty",
					visual: "graphic",
					durationSeconds: 8,
					videoPrompt:
						'Sound: a soft whoosh as the gauge moves. A narrator says, "A floated idea is not a deal, and it would need agreement from both sides. Watch for what the status would cover and how Washington responds."',
					diagram: {
						type: "gauge",
						label: "UNCERTAINTY",
						direction: "up",
					},
				},
			],
		}),
	},
	{
		label: "Why companies won't pause on AI (WSJ)",
		prompt:
			"https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
		poster: "/examples/ai-pause.jpg?v=3",
		invocation: example("example-ai-pause", "/examples/ai-pause.mp4?v=3", {
			analysis:
				"Only the headline was available, because the full article is behind a paywall, so this analysis uses general market logic and not the article's own reporting. The headline says companies are unlikely to pause their AI efforts. A general mechanism that fits is competition: if rivals keep investing, a firm that stops risks falling behind, so each company's spending raises pressure on the others to match it. If spending continues, makers of chips and operators of data centers could see steady demand, while the buying companies carry the cost now and wait for benefits that may come later. That is a likely reading, not a known fact, and the article's actual reasons could differ. The strongest competing view is that spending is not immune to pressure: if returns disappoint or borrowing gets more expensive, even determined companies could slow down. Without the full text, we cannot say which risks the article stresses.",
			metaphor:
				"A pack of cyclists on a road: stopping pedaling means dropping out of the pack, and a steeper climb tests who can keep going.",
			recurringElements: [
				"A tight pack of cyclists in plain grey jerseys and black helmets on slim silver road bikes, seen from behind",
			],
			look: "cinematic",
			styleBible:
				"Photographic cinematic footage, 35mm film look, shallow depth of field, natural muted colors of steel blue, grey and soft green with warm highlights, soft overcast daylight, calm and steady mood, no text anywhere in frame.",
			title: "Why companies keep investing in AI",
			takeaway:
				"Competition makes it hard for any one company to stop spending on AI, but disappointing returns or costly borrowing could change that.",
			totalSeconds: 50,
			followUps: [
				"Why do chipmakers benefit when AI spending continues?",
				"What is a data center and why does AI need so many?",
				"How could higher borrowing costs slow down AI spending?",
			],
			scenes: [
				{
					beat: "hook",
					visual: "metaphor",
					durationSeconds: 10,
					videoPrompt:
						'A tight pack of cyclists in plain grey jerseys and black helmets on slim silver road bikes, seen from behind, rides steadily without slowing along a coastal road. The camera tracks smoothly behind the pack at cycling speed. Soft overcast daylight. Sound: whirring wheels and light sea wind.. A narrator says, "A Wall Street Journal headline says companies are unlikely to hit pause on AI. Only the headline could be read, so this explainer uses general market logic, not the article\'s own reporting."',
				},
				{
					beat: "mechanism",
					visual: "metaphor",
					durationSeconds: 9,
					videoPrompt:
						'A tight pack of cyclists in plain grey jerseys and black helmets on slim silver road bikes, seen from behind, speeds along a road while the last rider eases off and a gap opens behind the pack. The camera tracks from behind the pack. Soft overcast daylight. Sound: whirring wheels and rhythmic breathing. A narrator says, "One basic force is competition. When rivals keep investing, a company that stops risks falling behind, much like a cyclist who eases off and drops out of the pack."',
				},
				{
					beat: "mechanism",
					visual: "graphic",
					durationSeconds: 8,
					videoPrompt:
						"Sound: a soft whoosh as each step appears. A narrator says, \"Each firm's spending raises the pressure on the next, so one company's investment can push rivals to match it. That feedback makes a coordinated pause unlikely.\"",
					diagram: {
						type: "chain",
						steps: ["RIVAL SPENDING", "MATCHING PRESSURE", "NO PAUSE"],
					},
				},
				{
					beat: "impact",
					visual: "metaphor",
					durationSeconds: 12,
					videoPrompt:
						'[0-6 seconds] The camera glides slowly down a wide aisle between tall black server racks in a vast data hall, small green lights flickering on the racks. [6-12 seconds] The camera keeps gliding toward the far end of the hall as cool air haze drifts across the floor. Cool blue-white overhead lighting. Sound: steady hum of cooling fans and servers. A narrator says, "If spending continues, makers of chips and operators of data centers, the warehouses of computers that run AI, could see steady demand. The risk sits with the buyers, who pay now for benefits that may arrive later."',
				},
				{
					beat: "uncertainty",
					visual: "metaphor",
					durationSeconds: 11,
					videoPrompt:
						'[0-5 seconds] A tight pack of cyclists in plain grey jerseys and black helmets on slim silver road bikes, seen from behind, begins climbing a road that steepens ahead. [5-11 seconds] The pack stretches out and slows as the climb gets harder, riders still pedaling. The camera tracks from behind at a low angle. Soft overcast daylight. Sound: heavy breathing and slow whirring wheels. A narrator says, "This view would be wrong if returns disappoint or money becomes expensive to borrow, which could force even determined companies to slow down. Without the full article, we cannot say which risks it highlights."',
				},
			],
		}),
	},
];
