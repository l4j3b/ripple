import { useEffect, useRef } from "react";

import { cn } from "#/lib/utils";

// Dark → light. Dense glyphs read as the bright ridges of each ripple.
const GLYPHS = " .:-=+*#%@";
const CELL = 9;

type AsciiBackdropProps = {
	className?: string;
	/** When true, freeze on one frame (also used for reduced motion). */
	static?: boolean;
};

export function AsciiBackdrop({
	className,
	static: forceStatic = false,
}: AsciiBackdropProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const animate = !(forceStatic || reduceMotion);

		let cols = 0;
		let rows = 0;
		let dpr = 1;
		let frame = 0;
		let running = true;

		const resize = () => {
			const parent = canvas.parentElement;
			if (!parent) return;
			const { width, height } = parent.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			cols = Math.max(1, Math.ceil(width / CELL));
			rows = Math.max(1, Math.ceil(height / CELL));
			canvas.width = Math.floor(cols * CELL * dpr);
			canvas.height = Math.floor(rows * CELL * dpr);
			canvas.style.width = `${cols * CELL}px`;
			canvas.style.height = `${rows * CELL}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.font = `500 ${CELL}px ui-monospace, SFMono-Regular, Menlo, monospace`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
		};

		const paint = (time: number) => {
			const w = cols * CELL;
			const h = rows * CELL;
			ctx.clearRect(0, 0, w, h);

			// Origin on the logo (py-16 + half of size-16).
			const cx = cols / 2;
			const cy = 132 / CELL;
			const t = time * 0.00025;
			const reach = Math.max(cols * 1.35, rows * 1.2);

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const dx = x - cx;
					const dy = (y - cy) * 0.8;
					const dist = Math.hypot(dx, dy);
					const ring = 0.5 + 0.5 * Math.sin(dist * 0.14 - t * 4.2);
					const envelope = Math.exp(-((dist / reach) ** 2) * 0.55);
					const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
					const grain = hash - Math.floor(hash);
					const v = Math.max(
						0,
						Math.min(
							1,
							(0.18 + ring * 0.7) * envelope * (0.86 + grain * 0.28),
						),
					);

					const glyph = GLYPHS[(v * (GLYPHS.length - 1)) | 0];
					if (glyph === " " || glyph === ".") continue;

					const alpha = 0.06 + v * 0.18;
					ctx.fillStyle = `rgba(163, 176, 196, ${alpha.toFixed(3)})`;
					ctx.fillText(glyph, x * CELL + CELL / 2, y * CELL + CELL / 2);
				}
			}
		};

		resize();
		paint(0);

		const onResize = () => {
			resize();
			paint(performance.now());
		};
		window.addEventListener("resize", onResize);

		if (animate) {
			const tick = (now: number) => {
				if (!running) return;
				paint(now);
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		}

		return () => {
			running = false;
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", onResize);
		};
	}, [forceStatic]);

	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 size-full select-none",
				className,
			)}
		>
			<canvas className="size-full" ref={canvasRef} />
		</div>
	);
}
