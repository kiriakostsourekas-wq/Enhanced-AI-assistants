"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-content";
import type { ChatApiResponse, ChatMessage } from "@/lib/chatbot/types";

type UseChatbotSessionOptions = {
  fallbackErrorMessage?: string;
  initialAssistantMessage: string;
  limitReachedMessage?: string;
  locale: Locale;
  maxUserMessages?: number;
  persistKey?: string;
};

type ChatFeedbackChoice = "yes" | "no";

type PersistedChatState = {
  ctaHref?: string;
  feedbackChoice?: ChatFeedbackChoice;
  isConversationClosed?: boolean;
  messages?: ChatMessage[];
};

const HISTORY_LIMIT = 8;

function isChatMessageArray(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const role = (item as ChatMessage).role;
    const content = (item as ChatMessage).content;

    return (role === "user" || role === "assistant") && typeof content === "string";
  });
}

function removeLatestMessage(messages: ChatMessage[], target: ChatMessage) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const candidate = messages[index];

    if (candidate.role === target.role && candidate.content === target.content) {
      return [...messages.slice(0, index), ...messages.slice(index + 1)];
    }
  }

  return messages;
}

function countUserMessages(messages: ChatMessage[]) {
  return messages.filter((message) => message.role === "user").length;
}

function isFeedbackChoice(value: unknown): value is ChatFeedbackChoice {
  return value === "yes" || value === "no";
}

function isConversationClosureMessage(messages: ChatMessage[], finalAssistantMessage: string) {
  const lastMessage = messages.at(-1);

  return lastMessage?.role === "assistant" && lastMessage.content === finalAssistantMessage;
}

export function useChatbotSession({
  fallbackErrorMessage = "I couldn't answer right now. You can still book a demo.",
  initialAssistantMessage,
  limitReachedMessage,
  locale,
  maxUserMessages,
  persistKey,
}: UseChatbotSessionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConversationClosed, setIsConversationClosed] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<ChatFeedbackChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ctaHref, setCtaHref] = useState(siteConfig.primaryCta.href);
  const [hasHydrated, setHasHydrated] = useState(false);
  const isConversationClosedRef = useRef(false);
  const feedbackChoiceRef = useRef<ChatFeedbackChoice | null>(null);
  const feedbackSubmitLockRef = useRef(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    isConversationClosedRef.current = isConversationClosed;
  }, [isConversationClosed]);

  useEffect(() => {
    feedbackChoiceRef.current = feedbackChoice;
  }, [feedbackChoice]);

  useEffect(() => {
    if (!persistKey) {
      setHasHydrated(true);
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(persistKey);

      if (raw) {
        const parsed = JSON.parse(raw) as PersistedChatState;

        if (typeof parsed.ctaHref === "string" && parsed.ctaHref.trim()) {
          setCtaHref(parsed.ctaHref);
        }

        if (isFeedbackChoice(parsed.feedbackChoice)) {
          setFeedbackChoice(parsed.feedbackChoice);
        }

        if (isChatMessageArray(parsed.messages)) {
          const restoredMessages = parsed.messages;
          const hasReachedLimit =
            typeof maxUserMessages === "number" &&
            maxUserMessages > 0 &&
            countUserMessages(restoredMessages) >= maxUserMessages;
          const shouldBackfillClosureMessage = Boolean(
            !parsed.isConversationClosed && hasReachedLimit && limitReachedMessage,
          );
          const shouldCloseConversation = Boolean(parsed.isConversationClosed || hasReachedLimit);

          if (
            shouldBackfillClosureMessage &&
            limitReachedMessage &&
            !isConversationClosureMessage(restoredMessages, limitReachedMessage)
          ) {
            setMessages([
              ...restoredMessages,
              {
                role: "assistant",
                content: limitReachedMessage,
              },
            ]);
          } else {
            setMessages(restoredMessages);
          }

          if (shouldCloseConversation) {
            setIsConversationClosed(true);
          }
        } else if (parsed.isConversationClosed) {
          setIsConversationClosed(true);
        }
      }
    } catch {
      window.sessionStorage.removeItem(persistKey);
    } finally {
      setHasHydrated(true);
    }
  }, [limitReachedMessage, maxUserMessages, persistKey]);

  useEffect(() => {
    if (!persistKey || !hasHydrated) {
      return;
    }

    window.sessionStorage.setItem(
      persistKey,
      JSON.stringify({
        ctaHref,
        feedbackChoice: feedbackChoice ?? undefined,
        isConversationClosed,
        messages,
      } satisfies PersistedChatState),
    );
  }, [ctaHref, feedbackChoice, hasHydrated, isConversationClosed, messages, persistKey]);

  const displayMessages = useMemo(
    () =>
      messages.length > 0
        ? messages
        : [
            {
              role: "assistant" as const,
              content: initialAssistantMessage,
            },
          ],
    [initialAssistantMessage, messages],
  );

  async function sendMessage(nextMessage: string) {
    const trimmed = nextMessage.trim();

    if (!trimmed || isSubmitting || submitLockRef.current || isConversationClosedRef.current) {
      return false;
    }

    submitLockRef.current = true;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    const history = messages.slice(-HISTORY_LIMIT);
    const nextUserMessageCount = countUserMessages(messages) + 1;

    if (typeof maxUserMessages === "number" && maxUserMessages > 0 && nextUserMessageCount >= maxUserMessages) {
      setError(null);
      setInput("");
      setMessages((current) => [
        ...current,
        userMessage,
        ...(limitReachedMessage
          ? [
              {
                role: "assistant" as const,
                content: limitReachedMessage,
              },
            ]
          : []),
      ]);
      setIsConversationClosed(true);
      submitLockRef.current = false;
      return true;
    }

    setIsSubmitting(true);
    setError(null);
    setInput("");
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale,
          message: trimmed,
          history,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ChatApiResponse | null;

      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload?.ok === false ? payload.error.message : "Chat request failed.");
      }

      setCtaHref(payload.cta.href);
      setMessages((current) => [...current, { role: "assistant", content: payload.reply }]);
      return true;
    } catch (submissionError) {
      setMessages((current) => removeLatestMessage(current, userMessage));
      setInput(trimmed);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : fallbackErrorMessage,
      );
      return false;
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }

  function submitFeedback(nextChoice: ChatFeedbackChoice) {
    if (
      feedbackSubmitLockRef.current ||
      feedbackChoiceRef.current !== null ||
      !isConversationClosedRef.current
    ) {
      return false;
    }

    feedbackSubmitLockRef.current = true;
    setFeedbackChoice(nextChoice);
    feedbackChoiceRef.current = nextChoice;
    feedbackSubmitLockRef.current = false;
    return true;
  }

  return {
    ctaHref,
    displayMessages,
    error,
    feedbackChoice,
    hasHydrated,
    input,
    isConversationClosed,
    isFeedbackSubmitted: feedbackChoice !== null,
    isSubmitting,
    messages,
    sendMessage,
    setError,
    setInput,
    submitFeedback,
  };
}
