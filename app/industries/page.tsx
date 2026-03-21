import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Industry examples for clinics, dentists, med spas, salons, consultants, and home service businesses using AI-assisted booking flows.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        description="Northline fits best where inquiries come in regularly, response speed matters, and the business depends on booked appointments."
        eyebrow="Industries"
        highlights={[
          "Relevant wherever faster response improves conversion",
          "Useful when qualification matters before booking",
          "Easy to tailor around one niche later",
        ]}
        primaryAction={{ label: "Book a Demo", href: "/contact" }}
        secondaryAction={{ label: "Review services", href: "/solutions" }}
        title="Built for service businesses where faster response wins more bookings"
      />

      <section className="section">
        <div className="container industry-detail-grid">
          {siteConfig.industries.map((industry, index) => (
            <Reveal className="industry-detail-card card" delay={index * 0.05} key={industry.name}>
              <div className="industry-card-header">
                <h2>{industry.name}</h2>
                <span className="industry-outcome">{industry.outcome}</span>
              </div>
              <p>{industry.summary}</p>
              <div className="detail-stack">
                <div>
                  <span className="detail-label">Why it fits</span>
                  <p>{industry.assistantFit}</p>
                </div>
                <div>
                  <span className="detail-label">Typical friction</span>
                  <p>{industry.painPoint}</p>
                </div>
                <div>
                  <span className="detail-label">Common conversation themes</span>
                  <div className="mini-pill-row">
                    {industry.examples.map((example) => (
                      <span className="mini-pill" key={example}>
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <div className="container dual-column">
          <Reveal className="card">
            <p className="panel-label">Not limited to this list</p>
            <h2>Any business that depends on timely inquiries can adapt this structure.</h2>
            <p>
              The messaging is centralized, so the site can be tightened around one niche without
              rebuilding the architecture.
            </p>
          </Reveal>
          <Reveal className="card" delay={0.1}>
            <p className="panel-label">Next step</p>
            <h2>Start broad, then narrow the offer.</h2>
            <p>
              Once you decide which industry you want to target first, the message can be tightened
              around that specific booking problem quickly.
            </p>
            <Link className="button button-secondary inverted" href="/contact">
              Start tailoring the demo
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
