import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "AI Demos",
  description:
    "Explore AI demos for med spas, dentists, clinics, salons, consultants, and home service businesses.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        description="Preview how AI assistants can answer inquiries, capture lead details, and guide booking flows for different appointment-based businesses."
        eyebrow="AI Demos"
        highlights={[
          "Booking-focused demos for service businesses",
          "Built around real inquiry and scheduling situations",
          "Easy to tailor to one niche or offer later",
        ]}
        primaryAction={{ label: siteConfig.primaryCta.label, href: siteConfig.primaryCta.href }}
        secondaryAction={{ label: "View solutions", href: "/solutions" }}
        title="AI demos for real booking situations"
      />

      <section className="section">
        <div className="container">
          <div className="demo-grid demo-grid-page">
            {siteConfig.aiDemos.map((demo, index) => (
              <Reveal className="demo-card card" delay={index * 0.05} key={demo.title}>
                <div className="demo-card-top">
                  <div>
                    <h2>{demo.title}</h2>
                    <p className="demo-audience">{demo.audience}</p>
                  </div>
                  <span className="demo-badge">AI Demo</span>
                </div>
                <p>{demo.summary}</p>
                <div className="demo-chip-list">
                  {demo.handles.map((item) => (
                    <span className="mini-pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <strong className="demo-outcome">{demo.outcome}</strong>
                <Link className="button button-primary demo-card-cta" href={siteConfig.primaryCta.href}>
                  Book a Demo
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container ai-demos-bottom-grid">
          <Reveal className="card ai-demos-note-card">
            <p className="panel-label">How to use this page</p>
            <h2>Choose the demo that matches how your business books.</h2>
            <p>
              Start with the niche that is closest to your inquiries, then tighten the messaging,
              qualification questions, and booking flow around that exact audience.
            </p>
          </Reveal>

          <Reveal className="card ai-demos-cta-card" delay={0.1}>
            <p className="panel-label">Next step</p>
            <h2>Book a demo built around your business.</h2>
            <p>
              We tailor the assistant around your offer, your lead flow, and the way your team
              actually handles appointments.
            </p>
            <Link className="button button-primary" href={siteConfig.primaryCta.href}>
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
