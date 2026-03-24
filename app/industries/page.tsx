import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { getRequestLocale } from "@/lib/i18n-server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "AI Demos",
  description:
    "Explore AI demos for med spas, dentists, clinics, salons, consultants, and home service businesses.",
};

export default async function IndustriesPage() {
  const locale = await getRequestLocale();
  const siteContent = getSiteContent(locale);

  return (
    <>
      <PageHero
        description={siteContent.industriesPage.hero.description}
        eyebrow={siteContent.industriesPage.hero.eyebrow}
        highlights={siteContent.industriesPage.hero.highlights}
        panelLabel={siteContent.common.includedInApproachLabel}
        primaryAction={{ label: siteContent.primaryCta.label, href: siteContent.primaryCta.href }}
        secondaryAction={siteContent.industriesPage.hero.secondaryAction}
        title={siteContent.industriesPage.hero.title}
      />

      <section className="section">
        <div className="container">
          <div className="demo-grid demo-grid-page">
            {siteContent.aiDemos.map((demo, index) => (
              <Reveal className="demo-card card" delay={index * 0.05} key={demo.title}>
                <div className="demo-card-top">
                  <div>
                    <h2>{demo.title}</h2>
                    <p className="demo-audience">{demo.audience}</p>
                  </div>
                  <span className="demo-badge">{siteContent.industriesPage.cardBadge}</span>
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
                <Link className="button button-primary demo-card-cta" href={siteContent.primaryCta.href}>
                  {siteContent.industriesPage.cardButtonLabel}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container ai-demos-bottom-grid">
          <Reveal className="card ai-demos-note-card">
            <p className="panel-label">{siteContent.industriesPage.bottomNote.label}</p>
            <h2>{siteContent.industriesPage.bottomNote.title}</h2>
            <p>{siteContent.industriesPage.bottomNote.description}</p>
          </Reveal>

          <Reveal className="card ai-demos-cta-card" delay={0.1}>
            <p className="panel-label">{siteContent.industriesPage.bottomCta.label}</p>
            <h2>{siteContent.industriesPage.bottomCta.title}</h2>
            <p>{siteContent.industriesPage.bottomCta.description}</p>
            <Link className="button button-primary" href={siteContent.primaryCta.href}>
              {siteContent.primaryCta.label}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
