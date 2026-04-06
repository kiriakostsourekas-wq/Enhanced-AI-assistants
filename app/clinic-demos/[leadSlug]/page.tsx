import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { SectionIntro } from "@/components/ui/section-intro";
import { buildClinicDemoProfile, getClinicLeadSummaryBySlug } from "@/lib/demo-library/clinic-demo-profiles";

type ClinicDemoPageProps = {
  params: Promise<{
    leadSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ClinicDemoPageProps): Promise<Metadata> {
  const lead = await getClinicLeadSummaryBySlug((await params).leadSlug);

  if (!lead) {
    return {
      title: "Clinic Demo Not Found",
    };
  }

  return {
    title: `${lead.businessName} Demo`,
    description: lead.category ?? "Clinic demo generated from the local lead dataset.",
  };
}

export default async function ClinicDemoLeadPage({ params }: ClinicDemoPageProps) {
  const profile = await buildClinicDemoProfile((await params).leadSlug);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <PageHero
        description={profile.summary}
        eyebrow="Merged clinic demo"
        highlights={[
          profile.category ?? "Clinic lead",
          `${profile.template.title} template`,
          profile.liveDemoEligibility.eligible ? "Live-demo ready" : "Concept-mode safe",
        ]}
        panelLabel="Current status"
        primaryAction={{ label: "Open Core Template", href: profile.template.pageHref }}
        secondaryAction={profile.websiteUrl ? { label: "Visit Official Website", href: profile.websiteUrl } : undefined}
        title={profile.heroHeading}
      />

      <section className="section">
        <div className="container dual-column">
          <Reveal className="card">
            <p className="panel-label">Important public facts</p>
            <h2>{profile.businessName}</h2>
            <p>{profile.heroSubheading}</p>

            {profile.contactItems.length > 0 ? (
              <>
                <h3>Contact and access</h3>
                <ul className="detail-list">
                  {profile.contactItems.map((item) => (
                    <li key={`${item.label}:${item.value}`}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noreferrer">
                          {item.label}: {item.value}
                        </a>
                      ) : (
                        `${item.label}: ${item.value}`
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mini-pill-row">
              {profile.overlayChips.map((item) => (
                <span className="mini-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="section-actions left-aligned">
              <Link className="button button-primary" href={profile.template.pageHref}>
                Open template details
              </Link>
              <a className="button button-secondary" href={profile.template.mirrorHref} target="_blank" rel="noreferrer">
                Open clean mirror
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
                <strong>{profile.template.title} with clinic overlay</strong>
                <a
                  className="button button-secondary"
                  href={`${profile.template.mirrorHref}?lead=${profile.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in new tab
                </a>
              </div>
              <iframe
                src={`${profile.template.mirrorHref}?lead=${profile.slug}`}
                style={{ width: "100%", minHeight: "920px", border: 0, background: "#ffffff", borderRadius: "0 0 22px 22px" }}
                title={`${profile.businessName} merged demo preview`}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <Reveal>
            <SectionIntro
              eyebrow="Important information only"
              title="What gets carried into the demo layer"
              description="This is intentionally lean. It preserves the public facts that matter for a convincing website demo with integrated chat, and leaves the rest of the review-heavy pipeline out of the path."
            />
          </Reveal>

          <div className="service-grid">
            <Reveal className="service-card card" delay={0.04}>
              <span className="eyebrow">Services</span>
              <h2>Verified or high-signal treatments</h2>
              <ul className="detail-list">
                {(profile.services.length > 0 ? profile.services : ["No services were extracted with enough confidence."]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="service-card card" delay={0.1}>
              <span className="eyebrow">Trust and people</span>
              <h2>Names, specialties, and trust markers</h2>
              <ul className="detail-list">
                {(profile.trustMarkers.length > 0 ? profile.trustMarkers : ["No strong trust markers were extracted yet."]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="service-card card" delay={0.16}>
              <span className="eyebrow">Operational notes</span>
              <h2>Booking and safety state</h2>
              <ul className="detail-list">
                {(profile.bookingSignals.length > 0 ? profile.bookingSignals : ["No explicit booking signals were extracted."]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
                <li>{profile.liveDemoEligibility.rationale}</li>
                {profile.liveDemoEligibility.blockers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          {profile.unresolvedItems.length > 0 ? (
            <Reveal className="card" delay={0.2}>
              <p className="panel-label">Still unresolved</p>
              <h2>Items intentionally left out of the merged demo</h2>
              <ul className="detail-list">
                {profile.unresolvedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </section>
    </>
  );
}
