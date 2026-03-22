import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "AI chatbot lead capture, booking automation, website creation, and workflow support for appointment-based businesses.",
};

const deliveryPillars = [
  {
    title: "Response built into the website",
    copy:
      "The site is built to answer faster, guide better, and help more inquiries reach a booking decision.",
  },
  {
    title: "Lead capture that produces usable information",
    copy:
      "The business gets cleaner information back instead of vague form messages and scattered follow-up.",
  },
  {
    title: "Booking flow designed for real operations",
    copy:
      "Everything is framed around what helps a service business convert inquiries into actual appointments.",
  },
];

const capabilityRows = [
  "FAQ answering and lead engagement",
  "Lead qualification and intake logic",
  "Appointment prompts and scheduling handoff",
  "Conversion-focused website design",
  "Structured lead summaries for the business team",
  "A clean codebase ready for later integrations",
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        description="Northline combines faster first response, stronger lead capture, better booking flow, and cleaner website messaging into one service-business system."
        eyebrow="Solutions"
        highlights={[
          "Instant first response for new inquiries",
          "Better lead qualification and cleaner handoff",
          "Booking flow support for appointment-driven businesses",
          "Modern websites built around conversion",
        ]}
        primaryAction={{ label: siteConfig.primaryCta.label, href: siteConfig.primaryCta.href }}
        secondaryAction={{ label: "See industries", href: "/industries" }}
        title="Services built to help more inquiries become appointments"
      />

      <section className="section">
        <div className="container service-grid">
          {siteConfig.services.map((service, index) => (
            <Reveal className="service-card card" delay={index * 0.08} key={service.title}>
              <span className="eyebrow">{service.eyebrow}</span>
              <h2>{service.title}</h2>
              <p>{service.summary}</p>
              <ul className="detail-list">
                {service.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container dual-column">
          <Reveal className="card">
            <p className="panel-label">Why this approach converts better</p>
            <h2>Most service businesses do not need more inquiries first. They need a better way to handle the ones they already get.</h2>
            <p>
              When response is slow, booking is unclear, or follow-up becomes manual, leads leak out
              of the pipeline. Northline focuses on fixing that first.
            </p>
          </Reveal>

          <Reveal className="stacked-list" delay={0.1}>
            {deliveryPillars.map((pillar) => (
              <div className="list-card card" key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container capability-section">
          <Reveal>
            <p className="panel-label">Included capabilities</p>
            <h2>What Northline is designed to improve</h2>
          </Reveal>
          <div className="capability-grid">
            {capabilityRows.map((row, index) => (
              <Reveal className="capability-chip card" delay={index * 0.05} key={row}>
                <span>{row}</span>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions" delay={0.1}>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
