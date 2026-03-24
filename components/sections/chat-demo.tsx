"use client";

import { useState } from "react";

import type { SiteContent } from "@/lib/site-content";

type ChatDemoProps = {
  content: SiteContent["chatDemo"];
};

export function ChatDemo({ content }: ChatDemoProps) {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const activeScenario = content.scenarios[activeScenarioIndex];

  function handleScenario(index: number) {
    setActiveScenarioIndex(index);
    setSelectedSlot(null);
  }

  return (
    <div className="chat-shell card chat-demo-shell">
      <div className="chat-demo-top">
        <div>
          <p className="panel-label">{content.panelLabel}</p>
          <h3>{content.title}</h3>
        </div>

        <span className="chat-demo-tag">{activeScenario.audience}</span>
      </div>

      <div aria-label={content.tabsAriaLabel} className="chat-demo-tabs" role="tablist">
        {content.scenarios.map((scenario, index) => {
          const isActive = index === activeScenarioIndex;

          return (
            <button
              aria-selected={isActive}
              className={`chat-demo-tab${isActive ? " is-active" : ""}`}
              key={scenario.label}
              role="tab"
              type="button"
              onClick={() => handleScenario(index)}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      <div className="chat-demo-preview" key={activeScenario.label}>
        <div
          className="chat-messages chat-demo-messages"
          aria-label={`${activeScenario.label} ${content.previewAriaLabelSuffix}`}
        >
          {activeScenario.messages.map((message, index) => (
            <div className={`chat-message ${message.author}`} key={`${message.author}-${index}`}>
              <div className="message-bubble">{message.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-demo-next-step">
          <div className="chat-demo-next-step-copy">
            <span className="chat-demo-step-label">{content.nextStepLabel}</span>
            <strong>{activeScenario.nextStepTitle}</strong>
            <p>{activeScenario.nextStepMeta}</p>
          </div>

          <div className="slot-row chat-demo-slot-row">
            {activeScenario.slots.map((slot) => (
              <button
                aria-pressed={selectedSlot === slot}
                className={`slot-button chat-demo-slot${selectedSlot === slot ? " is-booked" : ""}`}
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
