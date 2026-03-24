import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "AI chatbot lead capture, booking automation, website creation, and workflow support for appointment-based businesses.",
};

export default async function SolutionsPage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <>
      <PageHero
        description={siteContent.solutionsPage.hero.description}
        eyebrow={siteContent.solutionsPage.hero.eyebrow}
        highlights={siteContent.solutionsPage.hero.highlights}
        panelLabel={siteContent.common.includedInApproachLabel}
        primaryAction={{ label: siteContent.primaryCta.label, href: siteContent.primaryCta.href }}
        secondaryAction={siteContent.solutionsPage.hero.secondaryAction}
        title={siteContent.solutionsPage.hero.title}
      />

      <section className="section">
        <div className="container service-grid">
          {siteContent.services.map((service, index) => (
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
            <p className="panel-label">{siteContent.solutionsPage.whyApproachLabel}</p>
            <h2>{siteContent.solutionsPage.whyApproachTitle}</h2>
            <p>{siteContent.solutionsPage.whyApproachDescription}</p>
          </Reveal>

          <Reveal className="stacked-list" delay={0.1}>
            {siteContent.solutionsPage.deliveryPillars.map((pillar) => (
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
            <p className="panel-label">{siteContent.solutionsPage.capabilitySectionLabel}</p>
            <h2>{siteContent.solutionsPage.capabilitySectionTitle}</h2>
          </Reveal>
          <div className="capability-grid">
            {siteContent.solutionsPage.capabilityRows.map((row, index) => (
              <Reveal className="capability-chip card" delay={index * 0.05} key={row}>
                <span>{row}</span>
              </Reveal>
            ))}
          </div>
          <Reveal className="section-actions" delay={0.1}>
            <Link className="button button-primary" href={siteContent.primaryCta.href}>
              {siteContent.solutionsPage.finalCtaLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
