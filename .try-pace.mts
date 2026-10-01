import { fal } from "@fal-ai/client";
import { sceneVideoPrompt, explainerSchema } from "#/lib/explainer";
const e = explainerSchema.parse({
  look: "cinematic", styleBible: "35mm film aesthetic, natural daylight, cool blue and grey tones, overcast sky.", title: "t", takeaway: "t",
  scenes: [{ beat: "hook", visual: "metaphor", durationSeconds: 12, videoPrompt: 'a large grey concrete dam with three wide steel sluice gates, viewed from downstream. The middle gate slowly opens wider, releasing more water into the river below. Slow push-in. A narrator says, "The Federal Reserve just cut interest rates by a quarter point, and it signaled that more cuts may follow soon."' }],
});
const s = e.scenes[0];
console.log("duration", s.durationSeconds);
const { data } = await fal.subscribe("minimax/h3-max/text-to-video", {
  input: { prompt: sceneVideoPrompt(e, s), duration: s.durationSeconds, resolution: "480P", aspect_ratio: "4:3", prompt_expansion_mode: "disabled" },
});
console.log((data as any).video?.url);
