import { ChevronDownIcon, PlayIcon } from "lucide-react";
import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

import { Suggestion } from "#/components/ai-elements/suggestion";
import { Spinner } from "#/components/ui/spinner";
import {
	type ExplainerVideoInvocation,
	sceneNarration,
	VIDEO_ASPECT_RATIO,
	type VideoAspectRatio,
} from "#/lib/explainer";
import { cn } from "#/lib/utils";

const RIPPLE_DELAYS = ["0s", "0.8s", "1.6s"];

const ASPECT_CLASS: Record<VideoAspectRatio, string> = {
	"4:3": "aspect-[4/3]",
	"16:9": "aspect-video",
};
const [ASPECT_WIDTH, ASPECT_HEIGHT] = VIDEO_ASPECT_RATIO.split(":").map(Number);

function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function statusText(
	invocation: ExplainerVideoInvocation,
	phase?: "retrieving" | "writing",
) {
	if (invocation.state === "input-streaming") {
		return phase === "retrieving"
			? "Retrieving the link…"
			: "Writing the script…";
	}
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
	onFollowUp,
	onOpen,
	phase,
	controls = "native",
}: {
	invocation: ExplainerVideoInvocation;
	onFollowUp?: (question: string) => void;
	onOpen?: () => void;
	phase?: "retrieving" | "writing";
	controls?: "native" | "play";
}) {
	const videoUrl =
		invocation.state === "output-available"
			? invocation.output.videoUrl
			: undefined;
	const [readyUrl, setReadyUrl] = useState<string | null>(null);
	const [playing, setPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const videoReady = videoUrl != null && readyUrl === videoUrl;

	useEffect(() => {
		const video = videoRef.current;
		if (!videoUrl || !video) return;
		const markReady = () => setReadyUrl(videoUrl);
		if (video.readyState >= 2) markReady();
		video.addEventListener("loadeddata", markReady);
		return () => video.removeEventListener("loadeddata", markReady);
	}, [videoUrl]);

	const togglePlayback = () => {
		const video = videoRef.current;
		if (!video) return;
		if (video.paused) {
			void video.play().then(
				() => setPlaying(true),
				() => setPlaying(false),
			);
			return;
		}
		video.pause();
		setPlaying(false);
	};

	if (invocation.state === "output-error") {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
				Couldn't create this video. {invocation.errorText}
			</div>
		);
	}

	const input = invocation.input;
	const status = statusText(invocation, phase);
	const followUps = (input?.followUps ?? []).filter(
		(question): question is string => Boolean(question),
	);

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
		<div className="flex w-full min-w-0 max-w-xl flex-col">
			<div className="flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
				<div
					className={cn(
						"relative overflow-hidden bg-slate-900",
						ASPECT_CLASS[VIDEO_ASPECT_RATIO],
					)}
				>
					{videoUrl && (
						<video
							className={cn(
								"absolute inset-0 size-full object-cover",
								videoReady ? "opacity-100" : "pointer-events-none opacity-0",
							)}
							controls={controls === "native"}
							height={ASPECT_HEIGHT}
							onClick={
								controls === "play" && playing ? togglePlayback : undefined
							}
							onEnded={() => setPlaying(false)}
							onError={() => setReadyUrl(videoUrl)}
							onLoadedData={() => setReadyUrl(videoUrl)}
							onPause={() => setPlaying(false)}
							playsInline
							preload="auto"
							ref={(node) => {
								videoRef.current = node;
								if (node && node.readyState >= 2) setReadyUrl(videoUrl);
							}}
							src={videoUrl}
							width={ASPECT_WIDTH}
						>
							<track kind="captions" label="English" srcLang="en" />
						</video>
					)}
					{controls === "play" && videoReady && !playing && (
						<button
							aria-label="Play video"
							className="absolute inset-0 flex cursor-pointer items-center justify-center"
							onClick={togglePlayback}
							type="button"
						>
							<span className="flex size-14 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur">
								<PlayIcon className="size-6 translate-x-0.5 fill-white text-white" />
							</span>
						</button>
					)}
					{!videoReady && videoUrl && (
						<div className="absolute inset-0 flex items-center justify-center bg-slate-900">
							<Spinner className="size-8 text-white/80" />
						</div>
					)}
					{!videoReady && !videoUrl && (
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
							onOpen ? (
								<button
									className="cursor-pointer text-left font-semibold text-base leading-snug underline-offset-4 hover:underline"
									onClick={onOpen}
									type="button"
								>
									{input.title}
								</button>
							) : (
								<h3 className="font-semibold text-base leading-snug">
									{input.title}
								</h3>
							)
						) : (
							<div aria-hidden="true" className="space-y-2.5 py-0.5">
								<div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
								<div className="h-3.5 w-full animate-pulse rounded-md bg-muted" />
								<div className="h-3.5 w-4/5 animate-pulse rounded-md bg-muted" />
							</div>
						)}
						{input?.takeaway && (
							<p className="text-muted-foreground text-sm leading-relaxed">
								{input.takeaway}
							</p>
						)}
						{scriptLines.length > 0 && (
							<details className="group pt-1">
								<summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-muted-foreground text-xs hover:text-foreground">
									Transcript
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
			{onFollowUp && videoUrl && followUps.length > 0 && (
				<div className="flex flex-wrap gap-2 pt-3">
					{followUps.map((question) => (
						<Suggestion
							className="h-auto whitespace-normal px-3 py-1.5 text-left font-normal text-muted-foreground"
							key={question}
							onClick={onFollowUp}
							suggestion={question}
						/>
					))}
				</div>
			)}
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
