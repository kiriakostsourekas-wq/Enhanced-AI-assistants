"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  author: "assistant" | "user";
  text: string;
};

type DemoScenario = {
  label: string;
  userMessage: string;
  responses: string[];
  summary: {
    fit: string;
    intent: string;
    nextStep: string;
  };
  slots: string[];
  captured: string[];
  notification: string;
};

const welcomeMessage =
  "Hi, I can answer a few questions, capture your details, and help you book the right next step.";

const scenarios: DemoScenario[] = [
  {
    label: "Dental consult",
    userMessage: "I’m interested in teeth whitening and want to book something next week.",
    responses: [
      "Absolutely. I can help with that.",
      "Are you a new patient, and do you prefer a daytime or evening consultation?",
      "Great. I’ve noted this as a new-patient cosmetic enquiry and can offer a few consultation times.",
    ],
    summary: {
      fit: "High intent",
      intent: "Cosmetic consultation",
      nextStep: "Offer whitening consult slots",
    },
    slots: ["Tue 10:00", "Wed 14:30", "Thu 17:15"],
    captured: ["New patient", "Whitening consult", "Next week timing", "Daytime preference"],
    notification: "New cosmetic enquiry packaged for front desk review.",
  },
  {
    label: "Med spa lead",
    userMessage: "Do you offer laser treatments, and can I get a consultation this weekend?",
    responses: [
      "Yes. We can answer treatment questions and help arrange a consultation.",
      "Before I suggest times, are you asking about a first visit or a follow-up treatment plan?",
      "Perfect. I’ve marked this as a first-visit laser consultation request with weekend preference.",
    ],
    summary: {
      fit: "Qualified",
      intent: "Laser consultation",
      nextStep: "Suggest weekend availability",
    },
    slots: ["Sat 11:00", "Sat 13:30", "Sun 10:15"],
    captured: ["First visit", "Laser treatment", "Weekend preference", "Consult request"],
    notification: "Consultation-ready med spa lead queued for booking follow-up.",
  },
  {
    label: "Salon booking",
    userMessage: "I need a color correction appointment and want to know how soon you can see me.",
    responses: [
      "Thanks. Color correction usually starts with a brief consultation to confirm timing and price.",
      "Have you had any recent at-home color changes, and is weekday evening availability best for you?",
      "Understood. I’ve marked this as a higher-touch appointment so the team receives the right context.",
    ],
    summary: {
      fit: "Needs consult",
      intent: "Color correction",
      nextStep: "Book consultation before service",
    },
    slots: ["Mon 18:00", "Tue 17:30", "Wed 19:00"],
    captured: ["Color correction", "Recent home color", "Evening preference", "Consult required"],
    notification: "Higher-touch salon lead flagged with prep context for staff.",
  },
  {
    label: "Home service quote",
    userMessage: "My AC stopped working today. Can someone come out tomorrow morning?",
    responses: [
      "I’m sorry you’re dealing with that.",
      "I can capture a few details and help move this into the right booking or dispatch queue.",
      "I’ve tagged this as an urgent HVAC enquiry with next-morning preference and added it for priority follow-up.",
    ],
    summary: {
      fit: "Urgent lead",
      intent: "HVAC repair",
      nextStep: "Escalate and suggest dispatch windows",
    },
    slots: ["Tomorrow 08:30", "Tomorrow 10:00", "Tomorrow 11:30"],
    captured: ["Urgent issue", "HVAC repair", "Tomorrow morning", "Priority follow-up"],
    notification: "Urgent service lead marked for first-call dispatch handling.",
  },
];

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { author: "assistant", text: welcomeMessage },
  ]);
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(scenarios[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const displayedSlots = useMemo(() => {
    if (!activeScenario || isTyping) {
      return [];
    }

    return activeScenario.slots;
  }, [activeScenario, isTyping]);

  const demoStatus =
    bookedSlot ? "Booked in demo" : isTyping ? "Qualifying lead" : "Lead-to-booking demo";

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    const initialScenario = scenarios[0];
    setMessages([
      { author: "assistant", text: welcomeMessage },
      { author: "user", text: initialScenario.userMessage },
      ...initialScenario.responses.map((text) => ({ author: "assistant" as const, text })),
    ]);
  }, []);

  const handleScenario = (scenario: DemoScenario) => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setIsTyping(true);
    setBookedSlot(null);
    setActiveScenario(scenario);
    setMessages([
      { author: "assistant", text: welcomeMessage },
      { author: "user", text: scenario.userMessage },
    ]);

    scenario.responses.forEach((response, index) => {
      const timeoutId = window.setTimeout(() => {
        setMessages((current) => [...current, { author: "assistant", text: response }]);

        if (index === scenario.responses.length - 1) {
          setIsTyping(false);
        }
      }, 450 + index * 500);

      timeoutsRef.current.push(timeoutId);
    });
  };

  const handleBookSlot = (slot: string) => {
    if (!activeScenario) {
      return;
    }

    setBookedSlot(slot);
    setMessages((current) => [
      ...current,
      { author: "user", text: `Let’s book ${slot}.` },
      {
        author: "assistant",
        text: `Done. I’ve marked ${slot} as the preferred appointment and packaged the enquiry details for the business team.`,
      },
    ]);
  };

  return (
    <div className="chat-shell card">
      <div className="chat-header">
        <div>
          <p className="panel-label">Live booking demo</p>
          <h3>See how an inquiry gets moved toward an appointment</h3>
        </div>
        <span className="chat-status">{demoStatus}</span>
      </div>

      <div className="chat-chip-grid">
        {scenarios.map((scenario) => (
          <button
            className={`chat-chip${activeScenario?.label === scenario.label ? " is-active" : ""}`}
            key={scenario.label}
            type="button"
            onClick={() => handleScenario(scenario)}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.author}`} key={`${message.text}-${index}`}>
            <div className="message-bubble">{message.text}</div>
          </div>
        ))}
        {isTyping ? (
          <div className="chat-message assistant">
            <div className="message-bubble typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      <div className="chat-footer">
        <div>
          <p className="panel-label">Suggested slots</p>
          <div className="slot-row">
            {displayedSlots.map((slot) => (
              <button
                className={`slot-button${bookedSlot === slot ? " is-booked" : ""}`}
                key={slot}
                type="button"
                onClick={() => handleBookSlot(slot)}
              >
                {bookedSlot === slot ? `Booked: ${slot}` : slot}
              </button>
            ))}
          </div>
        </div>

        {activeScenario ? (
          <div className="chat-summary">
            <div>
              <span>Lead quality</span>
              <strong>{activeScenario.summary.fit}</strong>
            </div>
            <div>
              <span>Intent</span>
              <strong>{activeScenario.summary.intent}</strong>
            </div>
            <div>
              <span>Next step</span>
              <strong>{activeScenario.summary.nextStep}</strong>
            </div>
          </div>
        ) : null}
      </div>

      {activeScenario ? (
        <div className="chat-insight-grid">
          <div className="chat-insight-card">
            <p className="panel-label">Captured in flow</p>
            <div className="chat-detail-list">
              {activeScenario.captured.map((item) => (
                <span className="chat-detail-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="chat-insight-card">
            <p className="panel-label">Business handoff</p>
            <strong className="chat-alert-title">
              {bookedSlot ? `Preferred slot held: ${bookedSlot}` : activeScenario.notification}
            </strong>
            <p className="chat-alert-copy">
              {bookedSlot
                ? "The business team receives the conversation summary, selected slot, and lead context without needing to reconstruct the enquiry."
                : "Once the lead is ready, the assistant can move from answering questions to prompting the next step and preparing the handoff."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
