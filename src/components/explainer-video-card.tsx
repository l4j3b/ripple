import { ChevronDownIcon, PlayIcon } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { Shimmer } from "#/components/ai-elements/shimmer";
import { Spinner } from "#/components/ui/spinner";
import { type ExplainerVideoInvocation, sceneNarration } from "#/lib/explainer";
import { cn } from "#/lib/utils";

const RIPPLE_DELAYS = ["0s", "0.8s", "1.6s"];

function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function statusText(invocation: ExplainerVideoInvocation) {
	if (invocation.state === "input-streaming") return "Writing the script…";
	const progress =
		invocation.state === "output-available"
			? invocation.output.progress
			: undefined;
	if (progress?.stage === "stitching") return "Joining scenes…";
	const total = progress?.scenesTotal ?? invocation.input?.scenes.length ?? 1;
	if (total <= 1) return "Generating video…";
	return `Generating scenes · ${progress?.scenesDone ?? 0} of ${total} ready`;
}

export function ExplainerVideoCard({
	invocation,
}: {
	invocation: ExplainerVideoInvocation;
}) {
	const videoUrl =
		invocation.state === "output-available"
			? invocation.output.videoUrl
			: undefined;
	const [readyUrl, setReadyUrl] = useState<string | null>(null);
	const videoReady = videoUrl != null && readyUrl === videoUrl;

	if (invocation.state === "output-error") {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
				Couldn't create this video. {invocation.errorText}
			</div>
		);
	}

	const input = invocation.input;
	const status = statusText(invocation);

	const scriptLines: { start: number; narration: string }[] = [];
	let elapsed = 0;
	for (const scene of input?.scenes ?? []) {
		if (!scene?.videoPrompt) continue;
		scriptLines.push({
			start: elapsed,
			narration: sceneNarration(scene.videoPrompt),
		});
		elapsed += scene.durationSeconds ?? 0;
	}

	return (
		<div className="w-full min-w-0 max-w-xl overflow-hidden rounded-2xl border bg-card shadow-sm">
			<div className="relative aspect-video overflow-hidden bg-slate-900">
				{videoUrl && (
					<video
						className={cn(
							"absolute inset-0 size-full object-cover",
							videoReady ? "opacity-100" : "pointer-events-none opacity-0",
						)}
						controls
						height={9}
						onError={() => setReadyUrl(videoUrl)}
						onLoadedData={() => setReadyUrl(videoUrl)}
						playsInline
						preload="auto"
						ref={(node) => {
							if (node && node.readyState >= 2) setReadyUrl(videoUrl);
						}}
						src={videoUrl}
						width={16}
					>
						<track kind="captions" label="English" srcLang="en" />
					</video>
				)}
				{!videoReady && (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
						<div className="pointer-events-none absolute inset-0 animate-[sweep_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

						<div className="relative flex size-14 items-center justify-center">
							{RIPPLE_DELAYS.map((delay) => (
								<span
									className="absolute inset-0 animate-[ripple-out_2.4s_ease-out_infinite] rounded-full border border-teal-300/50"
									key={delay}
									style={{ animationDelay: delay }}
								/>
							))}
							<div className="relative flex size-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
								<PlayIcon className="size-6 translate-x-0.5 fill-white text-white" />
							</div>
						</div>

						<span className="absolute bottom-4 left-3 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 font-medium text-white/80 text-xs">
							<Spinner className="size-3" />
							{status}
						</span>

						<div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/10">
							<div className="h-full w-2/5 animate-[progress-indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
						</div>
					</div>
				)}
				{input?.totalSeconds && (
					<span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 font-medium text-white/80 text-xs tabular-nums">
						{formatDuration(input.totalSeconds)}
					</span>
				)}
			</div>

			<AnimatedHeight>
				<div className="space-y-2 p-4">
					{input?.title ? (
						<h3 className="font-semibold text-base leading-snug">
							{input.title}
						</h3>
					) : (
						<Shimmer className="font-semibold text-base">
							Reading the story…
						</Shimmer>
					)}
					{input?.takeaway && (
						<p className="text-muted-foreground text-sm leading-relaxed">
							{input.takeaway}
						</p>
					)}
					{scriptLines.length > 0 && (
						<details className="group pt-1">
							<summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-muted-foreground text-xs hover:text-foreground">
								Script
								<ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
							</summary>
							<ol className="mt-2 space-y-2 rounded-lg bg-muted p-3 text-muted-foreground text-xs leading-relaxed">
								{scriptLines.map((line) => (
									<li className="flex gap-3" key={line.start}>
										<span className="shrink-0 tabular-nums opacity-60">
											{formatDuration(line.start)}
										</span>
										<span>{line.narration}</span>
									</li>
								))}
							</ol>
						</details>
					)}
				</div>
			</AnimatedHeight>
		</div>
	);
}

function AnimatedHeight({ children }: { children: ReactNode }) {
	const innerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number>();

	useLayoutEffect(() => {
		const inner = innerRef.current;
		if (!inner) return;

		let frame = 0;
		const measure = () => {
			const next = Math.ceil(inner.getBoundingClientRect().height);
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				setHeight((current) => (current === next ? current : next));
			});
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(inner);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [children]);

	return (
		<div
			className="overflow-hidden transition-[height] duration-500 ease-out motion-reduce:transition-none"
			style={height === undefined ? undefined : { height }}
		>
			<div ref={innerRef}>{children}</div>
		</div>
	);
}
