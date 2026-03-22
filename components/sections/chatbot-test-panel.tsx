"use client";

import type { FormEvent } from "react";
import { useMemo } from "react";

import { useChatbotSession } from "@/components/chat/use-chatbot-session";

const STARTER_PROMPTS = [
  "What exactly do you help with?",
  "Is this a fit for a dental clinic?",
  "Can you also improve my website?",
  "What happens after I book a demo?",
];

const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I'm Lena. I can answer questions about how we help businesses convert more leads into booked appointments.";

export function ChatbotTestPanel() {
  const { ctaHref, displayMessages, error, input, isSubmitting, messages, sendMessage, setInput } =
    useChatbotSession({
      initialAssistantMessage: INITIAL_ASSISTANT_MESSAGE,
    });

  const showStarterPrompts = useMemo(() => messages.length === 0, [messages.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="chatbot-test-panel-inner">
      <div className="chatbot-thread" aria-live="polite">
        {displayMessages.map((message, index) => (
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

      {showStarterPrompts ? (
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
      ) : null}

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
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
          <a className="button button-secondary" href={ctaHref}>
            Book a Demo
          </a>
        </div>
      </form>
    </div>
  );
}
