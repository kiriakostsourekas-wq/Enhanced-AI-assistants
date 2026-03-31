import type { Metadata } from "next";
import Link from "next/link";
import { listReviewPreviewSummaries } from "@/lib/antigravity/review/review-artifacts";
import { loadOrCreateReviewRecord } from "@/lib/antigravity/review/review-store";

export const metadata: Metadata = {
  title: "Antigravity Review Dashboard",
  description: "Internal operator review queue for Athens clinic demos.",
};

const REVIEW_ORDER = {
  pending_review: 0,
  approved_for_outreach: 1,
  rejected: 2,
  do_not_contact: 3,
} as const;

function reviewLabel(status: keyof typeof REVIEW_ORDER) {
  switch (status) {
    case "approved_for_outreach":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "do_not_contact":
      return "Do not contact";
    default:
      return "Pending review";
  }
}

export default async function AntigravityReviewQueuePage() {
  const summaries = await listReviewPreviewSummaries();
  const queue = await Promise.all(
    summaries.map(async (summary) => ({
      summary,
      review: await loadOrCreateReviewRecord({
        campaignSlug: summary.campaignSlug,
        prospectSlug: summary.prospectSlug,
      }),
    })),
  );

  queue.sort((left, right) => {
    return (
      REVIEW_ORDER[left.review.decisionStatus] - REVIEW_ORDER[right.review.decisionStatus] ||
      left.summary.prospect.businessName.localeCompare(right.summary.prospect.businessName)
    );
  });

  const pendingCount = queue.filter((item) => item.review.decisionStatus === "pending_review").length;

  return (
    <main className="ag-review-shell" data-antigravity-review-root>
      <section className="ag-review-hero">
        <div className="ag-review-hero-copy">
          <p className="eyebrow">Internal review</p>
          <h1>Athens clinic demo queue</h1>
          <p>
            Operator-first review flow for current-site screenshots, grade reports, extracted facts, verification gates,
            demo previews, and Greek outreach drafts. No send action exists on this dashboard.
          </p>
        </div>

        <div className="ag-review-hero-stats">
          <div className="card">
            <span>Queue size</span>
            <strong>{queue.length}</strong>
          </div>
          <div className="card">
            <span>Pending review</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </section>

      <section className="ag-review-banner card">
        <strong>Draft-only safeguard</strong>
        <p>
          Outreach stays in review mode here. The dashboard supports approval and regeneration, but not sending, so there
          is no accidental auto-send path.
        </p>
      </section>

      <section className="ag-review-queue-grid">
        {queue.map(({ summary, review }) => (
          <article className="ag-review-queue-card card" key={`${summary.campaignSlug}:${summary.prospectSlug}`}>
            {summary.screenshotUrl ? (
              <img
                alt={`${summary.prospect.businessName} current site screenshot`}
                className="ag-review-queue-shot"
                src={summary.screenshotUrl}
              />
            ) : (
              <div className="ag-review-queue-shot ag-review-queue-shot-empty">No screenshot</div>
            )}

            <div className="ag-review-queue-copy">
              <div className="ag-review-inline-row">
                <span className={`ag-review-status-chip ag-review-status-${review.decisionStatus}`}>
                  {reviewLabel(review.decisionStatus)}
                </span>
                <span className={`ag-review-mode-chip ag-review-mode-${summary.landingPage.renderingMode}`}>
                  {summary.landingPage.renderingMode === "live_demo" ? "Live demo" : "Concept demo"}
                </span>
              </div>

              <h2>{summary.prospect.businessName}</h2>
              <p>{summary.prospect.category ?? "Clinic prospect"}</p>
              <p>
                {summary.prospect.city ?? "Athens"}, {summary.prospect.country ?? "Greece"}
              </p>

              <div className="ag-review-queue-metrics">
                <div>
                  <span>Demo score</span>
                  <strong>{summary.websiteGrade?.demoOpportunityScore ?? "n/a"}</strong>
                </div>
                <div>
                  <span>Validation</span>
                  <strong>{summary.contactValidation?.recommendedRenderMode ?? "n/a"}</strong>
                </div>
                <div>
                  <span>Draft</span>
                  <strong>{summary.outreachDraft ? "ready" : "missing"}</strong>
                </div>
              </div>

              <div className="ag-review-queue-actions">
                <Link className="button button-primary" href={`/antigravity-review/${summary.campaignSlug}/${summary.prospectSlug}`}>
                  Open review
                </Link>
                <a className="button button-secondary" href={`/antigravity-previews/${summary.campaignSlug}/${summary.prospectSlug}`} target="_blank" rel="noreferrer">
                  Open demo
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
