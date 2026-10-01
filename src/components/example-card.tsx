import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
	formatDuration,
	VIDEO_ASPECT_CLASS,
} from "#/components/explainer-video-card";
import type { LandingExample } from "#/lib/landing-examples";
import { cn } from "#/lib/utils";

const EXAMPLE_PLAY = "ripple-example-play";

export function ExampleCard({
	example,
	onOpen,
	active = true,
}: {
	example: LandingExample;
	onOpen: () => void;
	active?: boolean;
}) {
	const [playing, setPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (!active) setPlaying(false);
	}, [active]);

	useEffect(() => {
		const video = videoRef.current;
		if (!playing || !video) return;

		const onOther = (event: Event) => {
			if (event instanceof CustomEvent && event.detail !== video) {
				setPlaying(false);
			}
		};
		let started = false;
		const onPlaying = () => {
			started = true;
		};
		const onPause = () => {
			if (!started || video.seeking) return;
			setPlaying(false);
		};

		window.addEventListener(EXAMPLE_PLAY, onOther);
		window.dispatchEvent(new CustomEvent(EXAMPLE_PLAY, { detail: video }));
		for (const other of document.querySelectorAll("video")) {
			if (other !== video) other.pause();
		}
		video.addEventListener("playing", onPlaying);
		video.addEventListener("pause", onPause);
		void video.play().catch(() => setPlaying(false));

		return () => {
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("pause", onPause);
			window.removeEventListener(EXAMPLE_PLAY, onOther);
			video.pause();
		};
	}, [playing]);
	const { invocation } = example;
	if (invocation.state !== "output-available") return null;
	const { title, totalSeconds } = invocation.input;
	const { videoUrl } = invocation.output;

	return (
		<article className="group flex min-w-0 flex-col gap-3">
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl border bg-slate-900 shadow-sm",
					VIDEO_ASPECT_CLASS,
				)}
			>
				{playing && videoUrl ? (
					<video
						className="absolute inset-0 size-full object-cover"
						controls
						onEnded={() => setPlaying(false)}
						playsInline
						ref={videoRef}
						src={videoUrl}
					>
						<track kind="captions" label="English" srcLang="en" />
					</video>
				) : (
					<button
						aria-label={`Play “${title}”`}
						className="absolute inset-0 flex cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
						onClick={() => setPlaying(true)}
						type="button"
					>
						<img
							alt=""
							className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
							src={example.poster}
						/>
						<span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
						<span className="relative flex size-14 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur transition-transform duration-300 group-hover:scale-110">
							<PlayIcon className="size-6 translate-x-0.5 fill-white text-white" />
						</span>
					</button>
				)}
				{!playing && (
					<span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/50 px-2 py-1 font-medium text-white/90 text-xs tabular-nums">
						{formatDuration(totalSeconds)}
					</span>
				)}
			</div>
			<h3 className="px-1">
				<button
					className="line-clamp-2 cursor-pointer rounded-sm text-left font-semibold text-base leading-snug underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
					onClick={() => {
						setPlaying(false);
						onOpen();
					}}
					type="button"
				>
					{title}
				</button>
			</h3>
		</article>
	);
}
