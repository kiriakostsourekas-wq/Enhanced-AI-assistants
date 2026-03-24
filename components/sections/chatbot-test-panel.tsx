"use client";

import type { FormEvent } from "react";
import { useMemo } from "react";

import { useChatbotSession } from "@/components/chat/use-chatbot-session";
import type { SiteContent } from "@/lib/site-content";

type ChatbotTestPanelProps = {
  content: SiteContent["chatbotTestPanel"];
};

export function ChatbotTestPanel({ content }: ChatbotTestPanelProps) {
  const { ctaHref, displayMessages, error, input, isSubmitting, messages, sendMessage, setInput } =
    useChatbotSession({
      fallbackErrorMessage: content.errorFallback,
      initialAssistantMessage: content.initialAssistantMessage,
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
              {message.role === "assistant" ? content.roleLabels.assistant : content.roleLabels.user}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {showStarterPrompts ? (
        <div className="chatbot-quick-prompts">
          {content.quickPrompts.map((prompt) => (
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
          <span>{content.inputLabel}</span>
          <textarea
            className="form-input chatbot-textarea"
            name="chat-message"
            placeholder={content.placeholder}
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>

        {error ? <p className="chatbot-error">{error}</p> : null}

        <div className="chatbot-actions">
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? content.sendingLabel : content.sendLabel}
          </button>
          <a className="button button-secondary" href={ctaHref}>
            {content.ctaLabel}
          </a>
        </div>
      </form>
    </div>
  );
}
