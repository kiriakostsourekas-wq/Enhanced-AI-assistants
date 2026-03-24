"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { useChatbotSession } from "@/components/chat/use-chatbot-session";
import type { SiteContent } from "@/lib/site-content";

const OPEN_STATE_STORAGE_KEY = "northline-lena-widget-open";
const CHAT_SESSION_STORAGE_KEY = "northline-lena-widget-session";

const AVATAR_SRC = "/lena-avatar.jpg";

type SiteChatWidgetProps = {
  content: SiteContent["widget"];
};

export function SiteChatWidget({ content }: SiteChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const { ctaHref, displayMessages, error, input, isSubmitting, messages, sendMessage, setInput } =
    useChatbotSession({
      fallbackErrorMessage: content.connectionIssueDescription,
      initialAssistantMessage: content.initialAssistantMessage,
      persistKey: CHAT_SESSION_STORAGE_KEY,
    });
  const showDemoCta = Boolean(ctaHref) && (messages.length > 1 || Boolean(error));

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(OPEN_STATE_STORAGE_KEY);

      if (raw === "open") {
        setIsOpen(true);
      }
    } finally {
      setHasLoadedState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedState) {
      return;
    }

    window.sessionStorage.setItem(OPEN_STATE_STORAGE_KEY, isOpen ? "open" : "closed");
  }, [hasLoadedState, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      threadRef.current?.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [displayMessages.length, error, isOpen, isSubmitting]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (!hasLoadedState) {
    return null;
  }

  return (
    <div className={`site-chat-widget${isOpen ? " is-open" : ""}`}>
      <div
        aria-hidden={!isOpen}
        aria-label={content.launcherLabelClosed}
        className={`site-chat-panel${isOpen ? " is-open" : ""}`}
        id="site-chat-panel"
        role="dialog"
      >
        <div className="site-chat-panel-shell">
          <div className="site-chat-header">
            <div className="site-chat-avatar-wrap">
              <span className="site-chat-avatar" aria-hidden="true">
                <img alt="" src={AVATAR_SRC} />
              </span>
            </div>

            <div className="site-chat-header-copy">
              <strong>{content.headerTitle}</strong>
              <span>Lena</span>
            </div>

            <button
              aria-label={content.minimizeLabel}
              className="site-chat-collapse"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <div className="site-chat-thread" ref={threadRef}>
            {displayMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`site-chat-row site-chat-row-${message.role}`}
              >
                {message.role === "assistant" ? (
                  <span className="site-chat-message-avatar" aria-hidden="true">
                    <img alt="" src={AVATAR_SRC} />
                  </span>
                ) : null}

                <div className={`site-chat-message site-chat-message-${message.role}`}>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}

            {isSubmitting ? (
              <div className="site-chat-row site-chat-row-assistant">
                <span className="site-chat-message-avatar" aria-hidden="true">
                  <img alt="" src={AVATAR_SRC} />
                </span>

                <div className="site-chat-message site-chat-message-assistant site-chat-message-loading">
                  <div className="site-chat-typing" aria-label={content.typingLabel}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="site-chat-error">
              <strong>{content.connectionIssueTitle}</strong>
              <p>{content.connectionIssueDescription}</p>
            </div>
          ) : null}

          {showDemoCta ? (
            <div className="site-chat-cta-row">
              <span>{content.ctaPrompt}</span>
              <a className="site-chat-cta-link" href={ctaHref}>
                {content.ctaLabel}
              </a>
            </div>
          ) : null}

          <form className={`site-chat-composer${showDemoCta ? " has-cta-row" : ""}`} onSubmit={handleSubmit}>
            <label className="site-chat-input-wrap">
              <span className="sr-only">{content.inputLabel}</span>
              <input
                autoComplete="off"
                className="site-chat-input"
                name="lena-chat-message"
                placeholder={content.inputPlaceholder}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>

            <button className="site-chat-send" disabled={isSubmitting} type="submit">
              {isSubmitting ? "..." : content.sendLabel}
            </button>
          </form>
        </div>
      </div>

      <button
        aria-controls="site-chat-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? content.launcherLabelOpen : content.launcherLabelClosed}
        className={`site-chat-launcher${isOpen ? " is-hidden" : ""}`}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <span className="site-chat-launcher-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 4.75c-4.418 0-8 3.09-8 6.902 0 2.292 1.296 4.323 3.288 5.577l-.54 3.021 2.95-1.626c.738.164 1.51.25 2.302.25 4.418 0 8-3.09 8-6.902s-3.582-6.902-8-6.902Z"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle cx="9" cy="11.75" r="1" fill="currentColor" />
            <circle cx="12" cy="11.75" r="1" fill="currentColor" />
            <circle cx="15" cy="11.75" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className="sr-only">{content.launcherLabelClosed}</span>
      </button>
    </div>
  );
}
