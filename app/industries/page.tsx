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
        primaryAction={{ label: "Book a Demo", href: "/contact" }}
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
                <Link className="button button-primary demo-card-cta" href="/contact">
                  Book a Demo
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container dual-column">
          <Reveal className="card">
            <p className="panel-label">How to use this page</p>
            <h2>Pick the demo closest to your business model.</h2>
            <p>
              Once you know the niche or booking flow you want to lead with, the site and demos can
              be tightened around that exact audience quickly.
            </p>
          </Reveal>

          <Reveal className="card" delay={0.1}>
            <p className="panel-label">Next step</p>
            <h2>Book a demo and tailor it to your business.</h2>
            <p>
              We can adapt the messaging, qualifying questions, and booking actions around the way
              your business actually handles inquiries.
            </p>
            <Link className="button button-secondary inverted" href="/contact">
              Book a Demo
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
