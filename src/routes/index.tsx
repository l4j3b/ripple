import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { RotateCcwIcon, SquarePenIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
	Conversation,
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
import { ExplainerVideoCard } from "#/components/explainer-video-card";
import { Logo } from "#/components/logo";
import { Button } from "#/components/ui/button";
import { InputGroupAddon } from "#/components/ui/input-group";
import type { ExplainerUIMessage } from "#/lib/explainer";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function animateComposerMove(
	composer: HTMLElement | null,
	update: () => void,
) {
	const reduceMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (!composer || reduceMotion) {
		flushSync(update);
		return;
	}

	const first = composer.getBoundingClientRect();
	flushSync(update);
	const last = composer.getBoundingClientRect();
	const dx = first.left - last.left;
	const dy = first.top - last.top;
	if (Math.hypot(dx, dy) < 2) return;

	const animation = composer.animate(
		[
			{ transform: `translate(${dx}px, ${dy}px)` },
			{ transform: "translate(0px, 0px)" },
		],
		{ duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
	);
	animation.finished
		.then(() => {
			composer.style.transform = "";
			window.dispatchEvent(new Event("resize"));
		})
		.catch(() => {});
}

const EXAMPLES = [
	{
		label: "Fed raises rates a quarter point",
		text: "Fed raises rates a quarter point in first move of Warsh era",
	},
	{
		label: "Retail sales surge the most since March",
		text: "Retail sales last month surged by the most since March, when a spike in gasoline prices and a boost from tax refunds helped account for higher spending totals.",
	},
	{
		label: "EU floats associate membership for Canada",
		text: "EU chief floats associate membership for Canada after U.S. trade attacks",
	},
	{
		label: "Why companies won't pause on AI (WSJ)",
		text: "https://www.wsj.com/cio-journal/why-companies-are-unlikely-to-hit-pause-on-ai-9a4f6818",
	},
];

function Home() {
	const [chatId, setChatId] = useState("ripple");
	const [chatOpen, setChatOpen] = useState(false);
	const [pendingText, setPendingText] = useState<string | null>(null);
	const {
		messages,
		sendMessage,
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

	const composerRef = useRef<HTMLDivElement>(null);
	const landingSlotRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const composer = composerRef.current;
		if (!composer) return;

		if (hasStarted) {
			composer.style.position = "";
			composer.style.top = "";
			composer.style.left = "";
			composer.style.width = "";
			return;
		}

		const slot = landingSlotRef.current;
		if (!slot) return;

		const place = () => {
			slot.style.height = `${composer.offsetHeight}px`;
			const slotRect = slot.getBoundingClientRect();
			const parent = composer.offsetParent;
			const parentRect =
				parent instanceof HTMLElement
					? parent.getBoundingClientRect()
					: { top: 0, left: 0 };
			composer.style.position = "absolute";
			composer.style.top = `${slotRect.top - parentRect.top}px`;
			composer.style.left = `${slotRect.left - parentRect.left}px`;
			composer.style.width = `${slotRect.width}px`;
		};

		place();
		const observer = new ResizeObserver(place);
		observer.observe(composer);
		window.addEventListener("resize", place);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", place);
		};
	}, [hasStarted]);

	const submit = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || isGenerating) return;
		if (!hasStarted) {
			animateComposerMove(composerRef.current, () => {
				setPendingText(trimmed);
				setChatOpen(true);
			});
		}
		sendMessage({ text: trimmed });
	};

	const startOver = () => {
		if (!hasStarted) return;
		animateComposerMove(composerRef.current, () => {
			setPendingText(null);
			setChatOpen(false);
			setChatId(crypto.randomUUID());
		});
	};

	useEffect(() => {
		if (
			pendingText &&
			messages.some((message) => message.role === "user")
		) {
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
					hasStarted
						? "opacity-100"
						: "pointer-events-none h-0 opacity-0",
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
						New explainer
					</Button>
				</div>
			</header>

			<div className="relative min-h-0 flex-1">
				<div
					className={cn(
						"absolute inset-0 flex flex-col transition-opacity duration-500 ease-out",
						hasStarted
							? "opacity-100"
							: "pointer-events-none opacity-0",
					)}
					inert={!hasStarted}
				>
			<Conversation>
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
													<ExplainerVideoCard invocation={part} key={key} />
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
								/>
							</MessageContent>
						</Message>
					)}

					{error && (
						<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
							<span className="flex-1">
								{error.message || "Something went wrong."}
							</span>
							<Button onClick={() => regenerate()} size="sm" variant="outline">
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
						"absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-500 ease-out",
						hasStarted
							? "pointer-events-none opacity-0"
							: "opacity-100",
					)}
					inert={hasStarted}
				>
					<div className="flex w-full max-w-2xl flex-col items-center gap-8">
						<div className="flex flex-col items-center text-center">
							<Logo className="size-16" />
							<h1 className="-mt-2 font-bold text-4xl tracking-tight sm:text-5xl">
								Ripple
							</h1>
							<p className="mt-12 max-w-md text-balance text-lg text-muted-foreground">
								Paste any market headline or article. Get a short video on what
								it means for your money, then ask follow-ups.
							</p>
						</div>
						<div className="w-full" ref={landingSlotRef} />
						<div className="flex flex-wrap justify-center gap-2">
							{EXAMPLES.map((example) => (
								<Suggestion
									className="font-normal text-muted-foreground"
									key={example.label}
									onClick={submit}
									suggestion={example.text}
								>
									{example.label}
								</Suggestion>
							))}
						</div>
					</div>
				</div>
			</div>

			<div
				className={cn(
					"z-20",
					hasStarted
						? "relative mx-auto w-full max-w-3xl px-4 pb-4"
						: "absolute",
				)}
				ref={composerRef}
			>
				{composer}
			</div>
		</main>
	);
}
