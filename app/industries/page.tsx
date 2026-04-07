import type { Metadata } from "next";
import Link from "next/link";

import { DemoTemplateCard } from "@/components/demo-library/template-card";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { hasLocalClinicLeadDataset, listClinicLeadSummaries } from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateCatalog } from "@/lib/demo-library/template-catalog";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Core Demo Library",
  description:
    "Browse Northline's core website demo templates integrated directly into the main site.",
};

const PAGE_COPY = {
  en: {
    eyebrow: "Core demo library",
    title: "Northline's core website demos are now integrated into the site.",
    description:
      "Each template page serves a stable mirrored demo directly inside Northline, so those demos can act as the base for tailored business sites with integrated chat.",
    highlights: [
      "11 core website templates served from the immutable source library",
      "Dedicated template pages with live mirrored previews",
      "Optional clinic lead overlays powered by the local CSV and snapshots",
    ],
    primaryActionLabel: "Browse clinic demos",
    secondaryActionLabel: "View solutions",
    cardActionLabel: "Open template",
    featuredBadge: "Featured",
    useCaseBadge: "Core template",
    handlesLabel: "Built for",
    outcomeLabel: "Best fit",
    showsLabel: "Template direction",
    noteLabel: "Why this matters",
    noteTitle: "The demo websites are no longer side files.",
    noteDescription:
      "They now sit inside the live marketing site, stay read-only at the source, and can be paired with real clinic leads without re-running the review-heavy pipeline.",
    ctaLabel: "Local clinic layer",
    ctaTitle: "Open the Athens clinic leads already mapped to these templates.",
    ctaDescription:
      "Your local CSV, current site snapshots, and lightweight extraction path now feed a separate clinic-demo view that only keeps the important public facts.",
  },
  gr: {
    eyebrow: "Βιβλιοθήκη core demos",
    title: "Τα core website demos της Northline είναι πλέον ενσωματωμένα μέσα στο site.",
    description:
      "Κάθε template page σερβίρει ένα σταθερό mirrored demo απευθείας μέσα στη Northline, ώστε αυτά τα demos να λειτουργούν ως βάση για προσαρμοσμένα business sites με ενσωματωμένο chat.",
    highlights: [
      "11 core website templates από την αμετάβλητη source library",
      "Ξεχωριστές σελίδες template με live mirrored previews",
      "Προαιρετικά clinic lead overlays από το local CSV και τα snapshots",
    ],
    primaryActionLabel: "Άνοιγμα clinic demos",
    secondaryActionLabel: "Δείτε λύσεις",
    cardActionLabel: "Άνοιγμα template",
    featuredBadge: "Προτεινόμενο",
    useCaseBadge: "Core template",
    handlesLabel: "Κατάλληλο για",
    outcomeLabel: "Καλύτερη χρήση",
    showsLabel: "Κατεύθυνση template",
    noteLabel: "Γιατί έχει σημασία",
    noteTitle: "Τα demo websites δεν είναι πλέον ξεχωριστά side files.",
    noteDescription:
      "Βρίσκονται πλέον μέσα στο live marketing site, παραμένουν read-only στην πηγή και μπορούν να συνδεθούν με πραγματικά clinic leads χωρίς το βαρύ review pipeline.",
    ctaLabel: "Τοπικό clinic layer",
    ctaTitle: "Ανοίξτε τα Athens clinic leads που έχουν ήδη αντιστοιχιστεί σε αυτά τα templates.",
    ctaDescription:
      "Το local CSV, τα τωρινά site snapshots και η ελαφριά extraction ροή τροφοδοτούν πλέον ξεχωριστό clinic-demo view που κρατά μόνο τα σημαντικά δημόσια facts.",
  },
} as const;

export default async function IndustriesPage() {
  const locale = await getRequestLocale();
  const pageCopy = PAGE_COPY[locale];
  const [templates, hasDataset, clinicLeads] = await Promise.all([
    getTemplateCatalog(),
    hasLocalClinicLeadDataset(),
    listClinicLeadSummaries(),
  ]);

  return (
    <>
      <PageHero
        description={pageCopy.description}
        eyebrow={pageCopy.eyebrow}
        highlights={pageCopy.highlights}
        panelLabel="What this adds"
        primaryAction={{ label: pageCopy.primaryActionLabel, href: "/clinic-demos" }}
        secondaryAction={{ label: pageCopy.secondaryActionLabel, href: "/solutions" }}
        title={pageCopy.title}
      />

      <section className="section">
        <div className="container">
          <div className="demo-grid demo-grid-page">
            {templates.map((template, index) => (
              <DemoTemplateCard
                actionLabel={pageCopy.cardActionLabel}
                badge={template.featured ? pageCopy.featuredBadge : pageCopy.useCaseBadge}
                delay={index * 0.05}
                handlesLabel={pageCopy.handlesLabel}
                href={template.pageHref}
                key={template.slug}
                outcomeLabel={pageCopy.outcomeLabel}
                showsLabel={pageCopy.showsLabel}
                template={template}
                featured={template.featured}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container ai-demos-bottom-grid">
          <Reveal className="card ai-demos-note-card">
            <p className="panel-label">{pageCopy.noteLabel}</p>
            <h2>{pageCopy.noteTitle}</h2>
            <p>{pageCopy.noteDescription}</p>
          </Reveal>

          <Reveal className="card ai-demos-cta-card" delay={0.1}>
            <p className="panel-label">{pageCopy.ctaLabel}</p>
            <h2>{pageCopy.ctaTitle}</h2>
            <p>{pageCopy.ctaDescription}</p>
            <div className="demo-chip-list">
              <span className="mini-pill">{templates.length} templates</span>
              <span className="mini-pill">{clinicLeads.length} local leads</span>
              {hasDataset ? <span className="mini-pill">dataset ready</span> : <span className="mini-pill">dataset missing</span>}
            </div>
            <Link className="button button-primary" href="/clinic-demos">
              {pageCopy.primaryActionLabel}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
