import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { TooltipProvider } from "#/components/ui/tooltip";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Ripple · Markets news, explained in video",
			},
			{
				name: "description",
				content:
					"Paste a headline or article and get a short video explaining what it means for markets.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/logo.png",
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function NotFound() {
	return (
		<main className="flex h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
			<p className="text-lg">This page doesn't exist.</p>
			<a className="text-sm text-muted-foreground underline underline-offset-4" href="/">
				Back to Ripple
			</a>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html className="dark" lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<TooltipProvider>{children}</TooltipProvider>
				<Scripts />
			</body>
		</html>
	);
}
