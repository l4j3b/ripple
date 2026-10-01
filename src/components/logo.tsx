import { cn } from "#/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<img
			alt=""
			className={cn("size-8 object-contain", className)}
			src="/logo.png"
		/>
	);
}
