import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how the Northline AI assistant answers questions, qualifies leads, proposes appointment slots, and notifies the business.",
};

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <>
      <PageHero
        description={siteContent.howItWorksPage.hero.description}
        eyebrow={siteContent.howItWorksPage.hero.eyebrow}
        highlights={siteContent.processSteps.map((step) => step.title)}
        panelLabel={siteContent.common.includedInApproachLabel}
        primaryAction={{ label: siteContent.primaryCta.label, href: siteContent.primaryCta.href }}
        secondaryAction={siteContent.howItWorksPage.hero.secondaryAction}
        title={siteContent.howItWorksPage.hero.title}
      />

      <section className="section">
        <div className="container timeline">
          {siteContent.processSteps.map((step, index) => (
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
          {siteContent.howItWorksPage.viewpoints.map((item, index) => (
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
            <p className="panel-label">{siteContent.howItWorksPage.launchProcessLabel}</p>
            <h2>{siteContent.howItWorksPage.launchProcessTitle}</h2>
          </Reveal>
          <div className="launch-grid">
            {siteContent.launchPhases.map((phase, index) => (
              <Reveal className="launch-card card" delay={index * 0.08} key={phase.title}>
                <span className="launch-number">0{index + 1}</span>
                <h3>{phase.title}</h3>
                <p>{phase.summary}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="cta-banner compact card" delay={0.12}>
            <div>
              <span className="eyebrow">{siteContent.howItWorksPage.shortVersionLabel}</span>
              <h2>{siteContent.howItWorksPage.finalCtaTitle}</h2>
            </div>
            <Link className="button button-primary" href={siteContent.primaryCta.href}>
              {siteContent.howItWorksPage.finalCtaLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
