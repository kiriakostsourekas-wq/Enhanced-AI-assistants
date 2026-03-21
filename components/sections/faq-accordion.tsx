"use client";

import { useState } from "react";

import type { FaqItem } from "@/lib/site-content";

type FaqAccordionProps = {
  items: readonly FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div className={`faq-item${isOpen ? " is-open" : ""}`} key={item.question}>
            <button
              aria-controls={`faq-panel-${index}`}
              aria-expanded={isOpen}
              className="faq-trigger"
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{item.question}</span>
              <span className="faq-symbol">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="faq-answer" id={`faq-panel-${index}`} role="region">
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
