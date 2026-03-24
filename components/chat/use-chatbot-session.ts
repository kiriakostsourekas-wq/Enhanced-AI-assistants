"use client";

import { useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/lib/site-content";
import type { ChatApiResponse, ChatMessage } from "@/lib/chatbot/types";

type UseChatbotSessionOptions = {
  fallbackErrorMessage?: string;
  initialAssistantMessage: string;
  persistKey?: string;
};

type PersistedChatState = {
  ctaHref?: string;
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

export function useChatbotSession({
  fallbackErrorMessage = "I couldn't answer right now. You can still book a demo.",
  initialAssistantMessage,
  persistKey,
}: UseChatbotSessionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ctaHref, setCtaHref] = useState(siteConfig.primaryCta.href);
  const [hasHydrated, setHasHydrated] = useState(false);

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

        if (isChatMessageArray(parsed.messages)) {
          setMessages(parsed.messages);
        }
      }
    } catch {
      window.sessionStorage.removeItem(persistKey);
    } finally {
      setHasHydrated(true);
    }
  }, [persistKey]);

  useEffect(() => {
    if (!persistKey || !hasHydrated) {
      return;
    }

    window.sessionStorage.setItem(
      persistKey,
      JSON.stringify({
        ctaHref,
        messages,
      } satisfies PersistedChatState),
    );
  }, [ctaHref, hasHydrated, messages, persistKey]);

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

    if (!trimmed || isSubmitting) {
      return false;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    const history = messages.slice(-HISTORY_LIMIT);

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
    }
  }

  return {
    ctaHref,
    displayMessages,
    error,
    hasHydrated,
    input,
    isSubmitting,
    messages,
    sendMessage,
    setError,
    setInput,
  };
}
