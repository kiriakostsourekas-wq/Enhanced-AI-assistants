"use client";

import type { FormEvent } from "react";
import { useMemo } from "react";
import { useChatbotSession } from "@/components/chat/use-chatbot-session";
import type { DemoLandingPage } from "@/lib/antigravity/schemas";

type ClinicDemoChatPanelProps = {
  chatbot: DemoLandingPage["chatbot"];
};

export function ClinicDemoChatPanel({ chatbot }: ClinicDemoChatPanelProps) {
  const {
    ctaHref,
    displayMessages,
    error,
    input,
    isSubmitting,
    messages,
    sendMessage,
    setInput,
  } = useChatbotSession({
    apiEndpoint: chatbot.endpointPath,
    fallbackErrorMessage: "Το chatbot demo δεν μπόρεσε να απαντήσει αυτή τη στιγμή.",
    initialAssistantMessage: chatbot.initialAssistantMessage,
    initialCtaHref: chatbot.cta.href,
    locale: "gr",
    persistKey: `antigravity-preview-chat:${chatbot.endpointPath}`,
  });

  const showStarterPrompts = useMemo(() => messages.length === 0, [messages.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="ag-demo-chat card" id="chatbot">
      <div className="ag-demo-chat-header">
        <div>
          <p className="eyebrow">Embedded chatbot</p>
          <h3>{chatbot.title}</h3>
        </div>
        <span className="ag-demo-chat-chip">Greek-first</span>
      </div>

      <p className="ag-demo-chat-description">{chatbot.description}</p>

      {chatbot.disabledReason ? (
        <div className="ag-demo-mode-note">
          <strong>Concept demo note</strong>
          <p>{chatbot.disabledReason}</p>
        </div>
      ) : null}

      <div className="ag-demo-chat-thread" aria-live="polite">
        {displayMessages.map((message, index) => (
          <div
            className={`ag-demo-chat-bubble ag-demo-chat-bubble-${message.role}`}
            key={`${message.role}-${index}`}
          >
            <span className="ag-demo-chat-role">{message.role === "assistant" ? "Assistant" : "Επισκέπτης"}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {showStarterPrompts ? (
        <div className="ag-demo-chat-prompts">
          {chatbot.starterPrompts.map((prompt) => (
            <button
              className="ag-demo-chat-prompt"
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form className="ag-demo-chat-composer" onSubmit={handleSubmit}>
        <label className="ag-demo-chat-input-wrap">
          <span className="sr-only">Μήνυμα</span>
          <textarea
            className="ag-demo-chat-input"
            name="antigravity-demo-chat"
            placeholder="Ρωτήστε για υπηρεσίες, εμπιστοσύνη, επικοινωνία ή ραντεβού"
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>

        {error ? <p className="ag-demo-chat-error">{error}</p> : null}

        <div className="ag-demo-chat-actions">
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "..." : "Αποστολή"}
          </button>
          <a className="button button-secondary" href={ctaHref}>
            {chatbot.cta.label}
          </a>
        </div>
      </form>
    </section>
  );
}
