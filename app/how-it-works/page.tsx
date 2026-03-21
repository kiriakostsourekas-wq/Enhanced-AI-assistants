import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how the Northline AI assistant answers questions, qualifies leads, proposes appointment slots, and notifies the business.",
};

const viewpoints = [
  {
    title: "For the visitor",
    copy:
      "A faster response, useful answers, and a clearer path toward the next step.",
  },
  {
    title: "For the business",
    copy:
      "A cleaner handoff with the details needed to confirm, follow up, or book.",
  },
  {
    title: "For the workflow",
    copy:
      "Less manual back-and-forth and a better chance of converting the inquiries you already have.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        description="Northline is designed to help businesses respond faster, capture better information, and guide more inquiries toward booked appointments."
        eyebrow="Workflow"
        highlights={siteConfig.processSteps.map((step) => step.title)}
        primaryAction={{ label: "Book a Demo", href: "/contact" }}
        secondaryAction={{ label: "View solutions", href: "/solutions" }}
        title="A simple process from inquiry to booking"
      />

      <section className="section">
        <div className="container timeline">
          {siteConfig.processSteps.map((step, index) => (
            <Reveal className="timeline-row" delay={index * 0.08} key={step.number}>
              <div className="timeline-index">
                <span>{step.number}</span>
              </div>
              <div className="timeline-card card">
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container feature-grid">
          {viewpoints.map((item, index) => (
            <Reveal className="feature-card card" delay={index * 0.08} key={item.title}>
              <div className="icon-badge">{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="panel-label">Launch process</p>
            <h2>Three phases to put the flow in place</h2>
          </Reveal>
          <div className="launch-grid">
            {siteConfig.launchPhases.map((phase, index) => (
              <Reveal className="launch-card card" delay={index * 0.08} key={phase.title}>
                <span className="launch-number">0{index + 1}</span>
                <h3>{phase.title}</h3>
                <p>{phase.summary}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="cta-banner compact card" delay={0.12}>
            <div>
              <span className="eyebrow">Short version</span>
              <h2>More inquiries answered. More leads qualified. More appointments booked.</h2>
            </div>
            <Link className="button button-primary" href="/contact">
              Book a demo
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
