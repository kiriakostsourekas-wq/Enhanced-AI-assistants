import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SectionIntro } from "@/components/ui/section-intro";
import {
  hasLocalClinicLeadDataset,
  listClinicLeadSummaries,
  listSavedClinicDemoProfileSlugs,
} from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateCatalog } from "@/lib/demo-library/template-catalog";

export const metadata: Metadata = {
  title: "Clinic Lead Demos",
  description: "Local Athens clinic leads matched to the core demo templates without the review-heavy pipeline.",
};

export const dynamic = "force-dynamic";

export default async function ClinicDemosPage() {
  const [hasDataset, leads, templates, savedProfileSlugs] = await Promise.all([
    hasLocalClinicLeadDataset(),
    listClinicLeadSummaries(),
    getTemplateCatalog(),
    listSavedClinicDemoProfileSlugs(),
  ]);
  const visibleLeads = leads.filter((lead) => savedProfileSlugs.has(lead.slug));
  const websiteBackedCount = visibleLeads.filter((lead) => lead.websiteUrl).length;
  const snapshotReadyCount = visibleLeads.filter((lead) => lead.snapshotStatus === "success").length;
  const templateTitleBySlug = new Map(templates.map((template) => [template.slug, template.title]));

  return (
    <>
      <PageHero
        description="This view stays on top of your local Athens clinic leads, existing snapshot setup, and a lighter extraction path. It skips the antigravity review queue and only keeps the facts needed to pair a clinic with a core website demo and integrated chat layer."
        eyebrow="Local clinic demos"
        highlights={[
          `${visibleLeads.length} clinic demos currently published`,
          `${websiteBackedCount} leads with usable websites`,
          `${snapshotReadyCount} demos generated from existing snapshot data`,
        ]}
        panelLabel="What this uses"
        primaryAction={{ label: "Browse Core Templates", href: "/industries" }}
        secondaryAction={{ label: "Book a Demo", href: "/contact" }}
        title="Athens clinic leads mapped to the core website demo library"
      />

      {!hasDataset ? (
        <section className="section">
          <div className="container">
            <article className="card">
              <h2>No local clinic dataset is available in this environment.</h2>
              <p>
                Add <code>clinics/athens_clinics_leads.csv</code> locally and this page will start surfacing your
                existing lead list immediately. The page is safe to keep in the repo because it falls back cleanly when
                the local CSV is missing.
              </p>
            </article>
          </div>
        </section>
      ) : visibleLeads.length === 0 ? (
        <section className="section">
          <div className="container">
            <article className="card">
              <h2>No published clinic demos are available yet.</h2>
              <p>
                Build compact profiles into <code>artifacts/clinic-demo-profiles</code> and this page will only expose
                those kept demos. Raw scraped snapshots are not required for the public view.
              </p>
            </article>
          </div>
        </section>
      ) : (
        <>
          <section className="section section-muted">
            <div className="container">
              <Reveal>
                <SectionIntro
                  eyebrow="How this differs"
                  title="Leads and setup stay, the review queue does not"
                  description="Each lead opens a compact clinic profile, keeps the important public facts, and overlays those facts on top of the matching Virtual Pros core demo. No grading gate, review queue, or outreach stage is required."
                />
              </Reveal>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="demo-grid demo-grid-page">
                {visibleLeads.map((lead, index) => (
                  <Reveal className="demo-card card" delay={index * 0.03} key={lead.slug}>
                    <div className="demo-card-top">
                      <div>
                        <h2>{lead.businessName}</h2>
                        <p className="demo-audience">{lead.category ?? "Clinic lead"}</p>
                      </div>
                      <span className="demo-badge">{templateTitleBySlug.get(lead.templateSlug) ?? lead.templateSlug}</span>
                    </div>

                    <p>{lead.address ?? lead.websiteUrl ?? "Clinic lead from the local CSV dataset."}</p>

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

                    <div className="demo-card-footer">
                      <div>
                        <span className="demo-card-label">Core demo</span>
                        <strong className="demo-outcome">{templateTitleBySlug.get(lead.templateSlug) ?? lead.templateSlug}</strong>
                      </div>
                      <span className="demo-card-action">Open</span>
                    </div>

                    <div className="section-actions left-aligned">
                      <Link className="button button-primary demo-card-cta" href={`/industries/${lead.templateSlug}/mirror?lead=${encodeURIComponent(lead.slug)}`}>
                        Open merged demo
                      </Link>
                      {lead.websiteUrl ? (
                        <a className="button button-secondary" href={lead.websiteUrl} target="_blank" rel="noreferrer">
                          Visit website
                        </a>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
