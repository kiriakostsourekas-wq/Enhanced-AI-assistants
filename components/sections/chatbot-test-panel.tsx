"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { ChatApiResponse, ChatMessage } from "@/lib/chatbot/types";

const STARTER_PROMPTS = [
  "What exactly do you help with?",
  "Is this a fit for a dental clinic?",
  "Can you also improve my website?",
  "What happens after I book a demo?",
];

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Ask about the offer, who it fits, or how the booking flow works. This panel calls the real local backend route.",
};

export function ChatbotTestPanel() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ctaHref, setCtaHref] = useState("/contact");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);

  const conversationHistory = useMemo(
    () => messages.filter((item) => item !== INITIAL_ASSISTANT_MESSAGE).slice(-8),
    [messages],
  );

  async function submitMessage(nextMessage: string) {
    const trimmed = nextMessage.trim();

    if (!trimmed || isSubmitting) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...conversationHistory, userMessage];

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
          history: conversationHistory,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ChatApiResponse | null;

      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload?.ok === false ? payload.error.message : "Chat request failed.");
      }

      setCtaHref(payload.cta.href);
      setMessages([...nextHistory, { role: "assistant", content: payload.reply }]);
    } catch (submissionError) {
      setMessages((current) =>
        current.filter(
          (item) => !(item.role === userMessage.role && item.content === userMessage.content),
        ),
      );
      setInput(trimmed);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while contacting the chatbot backend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="chatbot-test-panel-inner">
      <div className="chatbot-thread" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`chatbot-bubble chatbot-bubble-${message.role}`}
          >
            <span className="chatbot-bubble-label">
              {message.role === "assistant" ? "Assistant" : "You"}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <div className="chatbot-quick-prompts">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            className="chatbot-quick-button"
            type="button"
            onClick={() => setInput(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="chatbot-composer" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Your message</span>
          <textarea
            className="form-input chatbot-textarea"
            name="chat-message"
            placeholder="Ask about the service, industries, website support, or next steps."
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>

        {error ? <p className="chatbot-error">{error}</p> : null}

        <div className="chatbot-actions">
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
          <a className="button button-secondary" href={ctaHref}>
            Book a Demo
          </a>
        </div>
      </form>
    </div>
  );
}
