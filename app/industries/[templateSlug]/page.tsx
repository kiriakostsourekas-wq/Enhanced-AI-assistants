import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SectionIntro } from "@/components/ui/section-intro";
import { listClinicLeadSummaries } from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type TemplatePageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

async function loadTemplatePageData(params: Awaited<TemplatePageProps["params"]>) {
  const template = await getTemplateBySlug(params.templateSlug);

  if (!template) {
    notFound();
  }

  const relatedLeads = (await listClinicLeadSummaries()).filter((lead) => lead.templateSlug === template.slug).slice(0, 6);

  return { template, relatedLeads };
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { template } = await loadTemplatePageData(await params);

  return {
    title: `${template.title} Core Demo`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { template, relatedLeads } = await loadTemplatePageData(await params);

  return (
    <>
      <PageHero
        description={`${template.description} The mirrored site is served directly from the immutable Virtual Pros source library, while Northline uses it as the website foundation for tailored builds with integrated chat.`}
        eyebrow="Core website template"
        highlights={[
          template.heroHeading ? `Hero: ${template.heroHeading}` : "Hero copy extracted from the live demo",
          template.heroPrimaryCta ? `Primary CTA: ${template.heroPrimaryCta}` : "Primary CTA extracted from the live demo",
          template.fonts.length > 0 ? `Fonts: ${template.fonts.slice(0, 3).join(", ")}` : "Template fonts are preserved from the source demo",
        ]}
        panelLabel="What stays intact"
        primaryAction={{ label: "Open Full Demo", href: template.mirrorHref }}
        secondaryAction={{ label: "Browse Clinic Leads", href: "/clinic-demos" }}
        title={`${template.title} is now a first-class website demo system`}
      />

      <section className="section">
        <div className="container dual-column">
          <Reveal className="card">
            <p className="panel-label">Best fit</p>
            <h2>{template.bestFor}</h2>
            <p>{template.templateSummary ?? template.description}</p>
            <ul className="detail-list">
              {template.recommendedFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mini-pill-row">
              {template.navLabels.map((item) => (
                <span className="mini-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="card" delay={0.08} style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1rem 1rem 0",
                flexWrap: "wrap",
              }}
            >
              <strong>{template.title} mirror</strong>
              <a className="button button-secondary" href={template.mirrorHref} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            </div>
            <iframe
              src={template.mirrorHref}
              style={{ width: "100%", minHeight: "920px", border: 0, background: "#ffffff", borderRadius: "0 0 22px 22px" }}
              title={`${template.title} mirrored template`}
            />
          </Reveal>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="Extracted structure"
              title="What this template brings into the demo system"
              description="These signals come from the read-only template pack, so you can decide which structure to pair with a lead before adding clinic-specific facts."
            />
          </Reveal>

          <div className="service-grid">
            <Reveal className="service-card card" delay={0.04}>
              <span className="eyebrow">Hero direction</span>
              <h2>{template.heroHeading ?? `${template.title} template hero`}</h2>
              <p>{template.heroSubheading ?? template.description}</p>
              <ul className="detail-list">
                {(template.ctaHighlights.length > 0 ? template.ctaHighlights : ["Primary CTA extracted from the template"])
                  .slice(0, 5)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </Reveal>

            <Reveal className="service-card card" delay={0.1}>
              <span className="eyebrow">Section rhythm</span>
              <h2>Core page structure</h2>
              <p>The important sections are exposed here so you can match a clinic lead to the right layout quickly.</p>
              <ul className="detail-list">
                {(template.sectionHighlights.length > 0 ? template.sectionHighlights : ["Landing-page sections extracted from the template"]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="service-card card" delay={0.16}>
              <span className="eyebrow">Visual system</span>
              <h2>Palette and type cues</h2>
              <p>Use the live mirror as the source of truth while the Northline site surfaces the matching context around it.</p>
              <ul className="detail-list">
                <li>Primary color: {template.paletteTheme.primary ?? template.accentColor}</li>
                <li>Secondary color: {template.paletteTheme.secondary ?? "Inherited from the source demo"}</li>
                <li>Fonts: {template.fonts.length > 0 ? template.fonts.join(", ") : "Not extracted"}</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {relatedLeads.length > 0 ? (
        <section className="section">
          <div className="container">
            <Reveal>
              <SectionIntro
                eyebrow="Matched clinic leads"
                title={`Existing Athens clinic leads already mapped to ${template.title}`}
                description="These come from your local CSV. Opening one loads a compact profile and overlays only the important facts on top of the core mirrored demo."
              />
            </Reveal>

            <div className="demo-grid demo-grid-page">
              {relatedLeads.map((lead, index) => (
                <Reveal className="demo-card card" delay={index * 0.04} key={lead.slug}>
                  <div className="demo-card-top">
                    <div>
                      <h2>{lead.businessName}</h2>
                      <p className="demo-audience">{lead.category ?? "Clinic lead"}</p>
                    </div>
                    <span className="demo-badge">{template.title}</span>
                  </div>
                  <p>{lead.address ?? lead.websiteUrl ?? "Website-backed clinic lead from the local dataset."}</p>
                  <div className="demo-chip-list">
                    {[
                      lead.rating ? `${lead.rating.toFixed(1)} rating` : null,
                      lead.reviewsCount ? `${lead.reviewsCount} reviews` : null,
                      lead.snapshotStatus ? `snapshot: ${lead.snapshotStatus}` : null,
                    ]
                      .filter(Boolean)
                      .map((item) => (
                        <span className="mini-pill" key={item}>
                          {item}
                        </span>
                      ))}
                  </div>
                  <Link className="button button-primary demo-card-cta" href={`/clinic-demos/${lead.slug}`}>
                    Open merged demo
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
