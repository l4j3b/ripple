import { ChevronDownIcon, PlayIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Shimmer } from "#/components/ai-elements/shimmer";
import { Spinner } from "#/components/ui/spinner";
import type { ExplainerVideoInvocation } from "#/lib/explainer";

const RIPPLE_DELAYS = ["0s", "0.8s", "1.6s"];

function formatDuration(seconds: number) {
	return `0:${String(seconds).padStart(2, "0")}`;
}

export function ExplainerVideoCard({
	invocation,
}: {
	invocation: ExplainerVideoInvocation;
}) {
	if (invocation.state === "output-error") {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
				Couldn't create this video. {invocation.errorText}
			</div>
		);
	}

	const input = invocation.input;
	const videoUrl =
		invocation.state === "output-available"
			? invocation.output.videoUrl
			: undefined;
	const status =
		invocation.state === "input-streaming"
			? "Writing the script…"
			: "Generating video…";

	return (
		<div className="w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-sm">
			{videoUrl ? (
				<div className="relative">
					<video
						className="block h-auto w-full"
						controls
						playsInline
						preload="metadata"
						src={videoUrl}
					>
						<track kind="captions" label="English" srcLang="en" />
					</video>
					{input?.durationSeconds && (
						<span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 font-medium text-white/80 text-xs tabular-nums">
							{formatDuration(input.durationSeconds)}
						</span>
					)}
				</div>
			) : (
				<div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
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

					{input?.durationSeconds && (
						<span className="pointer-events-none absolute right-3 bottom-4 rounded-full bg-black/40 px-2 py-1 font-medium text-white/80 text-xs tabular-nums">
							{formatDuration(input.durationSeconds)}
						</span>
					)}
				</div>
			)}

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
					{input?.videoPrompt && (
						<details className="group pt-1">
							<summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-muted-foreground text-xs hover:text-foreground">
								Video prompt
								<ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
							</summary>
							<p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-muted-foreground text-xs leading-relaxed">
								{input.videoPrompt}
							</p>
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
