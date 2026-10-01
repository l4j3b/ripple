import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import {
	HeartIcon,
	LinkIcon,
	RotateCcwIcon,
	SquarePenIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
	Conversation,
	ConversationAutoscroll,
	ConversationContent,
	ConversationScrollButton,
} from "#/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "#/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "#/components/ai-elements/prompt-input";
import { Suggestion } from "#/components/ai-elements/suggestion";
import { ExampleCard } from "#/components/example-card";
import { ExplainerVideoCard } from "#/components/explainer-video-card";
import { Logo } from "#/components/logo";
import { Button } from "#/components/ui/button";
import { InputGroupAddon } from "#/components/ui/input-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import type { ExplainerUIMessage } from "#/lib/explainer";
import { LANDING_EXAMPLES, type LandingExample } from "#/lib/landing-examples";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function animateComposerMove(
	getComposer: () => HTMLElement | null,
	update: () => void,
) {
	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const composer = getComposer();
	if (!composer || reduceMotion) {
		flushSync(update);
		return;
	}

	const first = composer.getBoundingClientRect();
	flushSync(update);
	const next = getComposer();
	if (!next) return;
	const last = next.getBoundingClientRect();
	const dx = first.left - last.left;
	const dy = first.top - last.top;
	if (Math.hypot(dx, dy) < 2) return;

	const animation = next.animate(
		[
			{ transform: `translate(${dx}px, ${dy}px)` },
			{ transform: "translate(0px, 0px)" },
		],
		{ duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
	);
	animation.finished
		.then(() => {
			next.style.transform = "";
			window.dispatchEvent(new Event("resize"));
		})
		.catch(() => {});
}

function exampleThread(example: LandingExample): ExplainerUIMessage[] {
	const id = example.invocation.toolCallId;
	return [
		{
			id: `${id}-user`,
			role: "user",
			parts: [{ type: "text", text: example.prompt }],
		},
		{
			id: `${id}-assistant`,
			role: "assistant",
			parts: [
				{
					type: "tool-createExplainerVideo",
					...example.invocation,
				},
			],
		},
	];
}

function Home() {
	const [chatId, setChatId] = useState("ripple");
	const [chatOpen, setChatOpen] = useState(false);
	const [pendingText, setPendingText] = useState<string | null>(null);
	const [scrollNonce, setScrollNonce] = useState(0);
	const {
		messages,
		sendMessage,
		setMessages,
		status,
		stop,
		error,
		regenerate,
	} = useChat<ExplainerUIMessage>({
		id: chatId,
		transport: new DefaultChatTransport({ api: "/api/chat" }),
	});

	const hasStarted = chatOpen || messages.length > 0;
	const lastMessage = messages.at(-1);
	const liveToolPart =
		lastMessage?.role === "assistant"
			? lastMessage.parts.find(
					(part) => part.type === "tool-createExplainerVideo",
				)
			: undefined;
	const isGenerating = status === "submitted" || status === "streaming";
	const isWaitingForVideo = isGenerating && !liveToolPart;
	const lastUserText =
		messages
			.filter((message) => message.role === "user")
			.at(-1)
			?.parts.map((part) => (part.type === "text" ? part.text : ""))
			.join(" ") ??
		pendingText ??
		"";
	const readingLink = /\bhttps?:\/\//i.test(lastUserText);
	const prepStage =
		lastMessage?.role === "assistant"
			? lastMessage.parts.find((part) => part.type === "data-status")?.data
					.stage
			: undefined;
	const phase =
		prepStage === "writing" || !readingLink ? "writing" : "retrieving";

	const composerRef = useRef<HTMLDivElement>(null);
	const landingScrollRef = useRef<HTMLDivElement>(null);
	const landingSlotRef = useRef<HTMLDivElement>(null);

	const submit = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || isGenerating) return;
		if (!hasStarted) {
			const slot = landingSlotRef.current;
			const box = composerRef.current;
			if (slot && box) slot.style.height = `${box.offsetHeight}px`;
			animateComposerMove(
				() => composerRef.current,
				() => {
					setPendingText(trimmed);
					setChatOpen(true);
				},
			);
		}
		sendMessage({ text: trimmed });
		if (hasStarted) setScrollNonce((nonce) => nonce + 1);
	};

	const openExample = (example: LandingExample) => {
		if (hasStarted || isGenerating) return;
		const slot = landingSlotRef.current;
		const box = composerRef.current;
		if (slot && box) slot.style.height = `${box.offsetHeight}px`;
		animateComposerMove(
			() => composerRef.current,
			() => {
				setChatOpen(true);
				setMessages(exampleThread(example));
			},
		);
	};

	const startOver = () => {
		if (!hasStarted) return;
		animateComposerMove(
			() => composerRef.current,
			() => {
				if (landingSlotRef.current) landingSlotRef.current.style.height = "";
				setPendingText(null);
				setChatOpen(false);
				setChatId(crypto.randomUUID());
			},
		);
	};

	useEffect(() => {
		if (pendingText && messages.some((message) => message.role === "user")) {
			setPendingText(null);
		}
	}, [messages, pendingText]);

	const composer = (
		<PromptInput
			className="[&_[data-slot=input-group]]:h-auto [&_[data-slot=input-group]]:items-end [&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-sm"
			onSubmit={(message: PromptInputMessage) => submit(message.text)}
		>
			<PromptInputBody>
				<PromptInputTextarea
					className="min-h-0 py-3.5 pl-5 text-base leading-6 md:text-base"
					placeholder={
						hasStarted
							? "Ask a follow-up…"
							: "Paste a headline, article, or link…"
					}
					rows={1}
				/>
			</PromptInputBody>
			<InputGroupAddon
				align="inline-end"
				className="py-2 pr-1 has-[>button]:mr-0"
			>
				<PromptInputSubmit
					className="size-9 cursor-pointer rounded-full border-0 bg-[#14161a] p-0 text-neutral-400 shadow-none hover:bg-[#22252a] hover:text-neutral-300 focus-visible:border-transparent focus-visible:ring-0"
					onStop={stop}
					status={status}
				/>
			</InputGroupAddon>
		</PromptInput>
	);

	return (
		<main className="relative flex h-dvh flex-col overflow-hidden">
			<header
				className={cn(
					"shrink-0 overflow-hidden transition-opacity duration-500",
					hasStarted ? "opacity-100" : "pointer-events-none h-0 opacity-0",
				)}
				inert={!hasStarted}
			>
				<div className="flex items-center justify-between px-4 py-3">
					<button
						className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 font-semibold text-lg tracking-tight hover:bg-muted"
						onClick={startOver}
						type="button"
					>
						<Logo className="size-7" />
						Ripple
					</button>
					<Button onClick={startOver} size="sm" variant="ghost">
						<SquarePenIcon className="size-4" />
						New Ripple
					</Button>
				</div>
			</header>

			<div className="relative min-h-0 flex-1">
				<div
					className={cn(
						"absolute inset-0 flex flex-col transition-opacity duration-500 ease-out",
						hasStarted ? "opacity-100" : "pointer-events-none opacity-0",
					)}
					inert={!hasStarted}
				>
					<Conversation>
						<ConversationAutoscroll nonce={scrollNonce} />
						<ConversationContent className="mx-auto w-full max-w-3xl pb-8">
							{pendingText &&
								!messages.some((message) => message.role === "user") && (
									<Message from="user">
										<MessageContent>
											<p className="whitespace-pre-wrap">{pendingText}</p>
										</MessageContent>
									</Message>
								)}
							{messages.map((message) => {
								const parts = message.parts.filter(
									(part) =>
										!(
											part.type === "tool-createExplainerVideo" &&
											message.id === lastMessage?.id
										),
								);
								const hasVisiblePart = parts.some(
									(part) =>
										part.type === "text" ||
										part.type === "tool-createExplainerVideo",
								);
								if (!hasVisiblePart) return null;

								return (
									<Message from={message.role} key={message.id}>
										<MessageContent
											className={cn(message.role === "assistant" && "w-full")}
										>
											{parts.map((part, index) => {
												const key = `${message.id}-${index}`;
												switch (part.type) {
													case "text":
														return message.role === "user" ? (
															<p className="whitespace-pre-wrap" key={key}>
																{part.text}
															</p>
														) : (
															<MessageResponse key={key}>
																{part.text}
															</MessageResponse>
														);
													case "tool-createExplainerVideo":
														return (
															<ExplainerVideoCard
																invocation={part}
																key={key}
																onFollowUp={submit}
															/>
														);
													default:
														return null;
												}
											})}
										</MessageContent>
									</Message>
								);
							})}

							{(isWaitingForVideo || liveToolPart) && (
								<Message from="assistant" key="live-explainer">
									<MessageContent className="w-full">
										<ExplainerVideoCard
											invocation={
												liveToolPart ?? {
													state: "input-streaming",
													input: undefined,
													toolCallId: "pending",
												}
											}
											onFollowUp={submit}
											phase={phase}
										/>
									</MessageContent>
								</Message>
							)}

							{error && (
								<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
									<span className="flex-1">
										{error.message || "Something went wrong."}
									</span>
									<Button
										onClick={() => regenerate()}
										size="sm"
										variant="outline"
									>
										<RotateCcwIcon className="size-4" />
										Retry
									</Button>
								</div>
							)}
						</ConversationContent>
						<ConversationScrollButton />
					</Conversation>
				</div>

				<div
					className={cn(
						"absolute inset-0 overflow-y-auto px-4 transition-opacity duration-500 ease-out",
						hasStarted ? "pointer-events-none opacity-0" : "opacity-100",
					)}
					inert={hasStarted}
					ref={landingScrollRef}
				>
					<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 py-16">
						<div className="flex flex-col items-center text-center">
							<Logo className="size-16" />
							<h1 className="-mt-2 font-bold text-4xl tracking-tight sm:text-5xl">
								Ripple
							</h1>
							<p className="mt-12 mb-4 max-w-md text-balance text-lg text-muted-foreground">
								Paste any headline or article. Get a short video on how it
								ripples through markets, then ask follow-ups.
							</p>
						</div>
						<div className="w-full max-w-2xl" ref={landingSlotRef}>
							{!hasStarted && (
								<div className="w-full" ref={composerRef}>
									{composer}
								</div>
							)}
						</div>
						<div className="flex max-w-2xl flex-wrap justify-center gap-2">
							{LANDING_EXAMPLES.map((example) => {
								const link = /^https?:\/\//i.test(example.prompt)
									? example.prompt
									: null;
								if (!link) {
									return (
										<Suggestion
											className="font-normal text-muted-foreground"
											key={example.label}
											onClick={submit}
											suggestion={example.prompt}
										>
											{example.label}
										</Suggestion>
									);
								}
								return (
									<Tooltip key={example.label}>
										<TooltipTrigger asChild>
											<Suggestion
												className="font-normal text-muted-foreground"
												onClick={submit}
												suggestion={example.prompt}
											>
												<LinkIcon aria-hidden="true" className="size-3.5" />
												{example.label}
											</Suggestion>
										</TooltipTrigger>
										<TooltipContent
											className="max-w-[min(40rem,calc(100vw-2rem))] whitespace-nowrap text-left font-normal"
											side="top"
											sideOffset={6}
										>
											{link}
										</TooltipContent>
									</Tooltip>
								);
							})}
						</div>
						<section className="mt-8 flex w-full max-w-4xl flex-col gap-4">
							<h2 className="text-center font-semibold text-2xl tracking-tight">
								Recent Ripples
							</h2>
							<div className="grid grid-cols-2 gap-x-6 gap-y-8">
								{LANDING_EXAMPLES.map((example) => (
									<ExampleCard
										active={!hasStarted}
										example={example}
										key={example.invocation.toolCallId}
										onOpen={() => openExample(example)}
									/>
								))}
							</div>
						</section>
						<footer className="mt-16 flex flex-col items-center gap-8 pb-10 text-center">
							<p className="max-w-2xl text-pretty text-muted-foreground/60 text-xs">
								Educational explainers, not financial advice. Videos are
								AI-generated; check the sources.
							</p>
							<p className="inline-flex items-center gap-1 text-muted-foreground text-sm">
								Made with
								<HeartIcon
									aria-hidden="true"
									className="size-3.5 fill-emerald-400 text-emerald-400"
								/>
								in Sausalito.
							</p>
						</footer>
					</div>
				</div>
			</div>

			{hasStarted && (
				<div
					className="relative z-20 mx-auto w-full max-w-3xl px-4 pb-4"
					ref={composerRef}
				>
					{composer}
				</div>
			)}
		</main>
	);
}
