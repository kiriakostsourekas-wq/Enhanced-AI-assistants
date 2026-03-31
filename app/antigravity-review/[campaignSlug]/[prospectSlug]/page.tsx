import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClinicDemoChatPanel } from "@/components/antigravity/clinic-demo-chat-panel";
import { ReviewActionsPanel } from "@/components/antigravity/review-actions-panel";
import { loadReviewPreviewArtifacts } from "@/lib/antigravity/review/review-artifacts";
import { getEditableReviewFields, loadOrCreateReviewRecord } from "@/lib/antigravity/review/review-store";
import type { StructuredClinicField } from "@/lib/antigravity/schemas";

type ReviewPageProps = {
  params: Promise<{
    campaignSlug: string;
    prospectSlug: string;
  }>;
};

function factValueToText(field: StructuredClinicField) {
  if (field.status === "unresolved" || field.value === undefined || field.value === null) {
    return "Unresolved";
  }

  if (typeof field.value === "string") {
    return field.value;
  }

  if (typeof field.value === "number" || typeof field.value === "boolean") {
    return String(field.value);
  }

  if (typeof field.value === "object") {
    if ("displayText" in field.value && typeof field.value.displayText === "string") {
      return field.value.displayText;
    }

    if ("question" in field.value && typeof field.value.question === "string") {
      const answer = "answer" in field.value && typeof field.value.answer === "string" ? field.value.answer : "";
      return answer ? `${field.value.question}\nΑπάντηση: ${answer}` : field.value.question;
    }
  }

  return JSON.stringify(field.value);
}

function flattenStructuredFacts(structuredJson: Awaited<ReturnType<typeof loadReviewPreviewArtifacts>>["knowledgePack"]["structuredJson"]) {
  const entries: Array<{
    fieldKey: string;
    label: string;
    status: StructuredClinicField["status"];
    confidence: number;
    value: string;
    originalText?: string;
    englishSummary?: string;
  }> = [];

  const pushField = (fieldKey: string, field: StructuredClinicField) => {
    entries.push({
      fieldKey,
      label: field.label,
      status: field.status,
      confidence: field.confidence,
      value: factValueToText(field),
      originalText: field.originalText,
      englishSummary: field.englishSummary,
    });
  };

  pushField("clinicName", structuredJson.clinicName);
  pushField("clinicCategory", structuredJson.clinicCategory);
  structuredJson.coreServices.forEach((field) => pushField("coreServices", field));
  pushField("address", structuredJson.address);
  pushField("neighborhood", structuredJson.neighborhood);
  structuredJson.phoneNumbers.forEach((field) => pushField("phoneNumbers", field));
  structuredJson.emails.forEach((field) => pushField("emails", field));
  pushField("contactPageUrl", structuredJson.contactPageUrl);
  pushField("bookingUrl", structuredJson.bookingUrl);
  structuredJson.openingHours.forEach((field) => pushField("openingHours", field));
  structuredJson.doctorNames.forEach((field) => pushField("doctorNames", field));
  structuredJson.teamNames.forEach((field) => pushField("teamNames", field));
  pushField("yearsOfExperience", structuredJson.yearsOfExperience);
  structuredJson.qualificationsAndSpecialties.forEach((field) => pushField("qualificationsAndSpecialties", field));
  pushField("clinicStory", structuredJson.clinicStory);
  structuredJson.testimonials.forEach((field) => pushField("testimonials", field));
  structuredJson.trustMarkers.forEach((field) => pushField("trustMarkers", field));

  return entries;
}

function fieldDefaults(structuredJson: Awaited<ReturnType<typeof loadReviewPreviewArtifacts>>["knowledgePack"]["structuredJson"]) {
  return {
    clinicName: factValueToText(structuredJson.clinicName),
    clinicCategory: factValueToText(structuredJson.clinicCategory),
    coreServices: structuredJson.coreServices.map((field) => factValueToText(field)).join("\n"),
    address: factValueToText(structuredJson.address),
    neighborhood: factValueToText(structuredJson.neighborhood),
    phoneNumbers: structuredJson.phoneNumbers.map((field) => factValueToText(field)).join("\n"),
    emails: structuredJson.emails.map((field) => factValueToText(field)).join("\n"),
    contactPageUrl: factValueToText(structuredJson.contactPageUrl),
    bookingUrl: factValueToText(structuredJson.bookingUrl),
    openingHours: structuredJson.openingHours.map((field) => factValueToText(field)).join("\n"),
    doctorNames: structuredJson.doctorNames.map((field) => factValueToText(field)).join("\n"),
    teamNames: structuredJson.teamNames.map((field) => factValueToText(field)).join("\n"),
    yearsOfExperience: factValueToText(structuredJson.yearsOfExperience),
    qualificationsAndSpecialties: structuredJson.qualificationsAndSpecialties.map((field) => factValueToText(field)).join("\n"),
    clinicStory: factValueToText(structuredJson.clinicStory),
    testimonials: structuredJson.testimonials.map((field) => factValueToText(field)).join("\n"),
    trustMarkers: structuredJson.trustMarkers.map((field) => factValueToText(field)).join("\n"),
  } satisfies Record<string, string>;
}

async function loadPageData(params: Awaited<ReviewPageProps["params"]>) {
  try {
    const preview = await loadReviewPreviewArtifacts(params);
    const review = await loadOrCreateReviewRecord(params);
    return { preview, review };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { preview } = await loadPageData(await params);

  return {
    title: `${preview.prospect.businessName} | Review Dashboard`,
    description: `Internal review for ${preview.prospect.businessName}.`,
  };
}

export default async function AntigravityReviewDetailPage({ params }: ReviewPageProps) {
  const { preview, review } = await loadPageData(await params);
  const facts = flattenStructuredFacts(preview.knowledgePack.structuredJson);
  const overrideKeys = new Set(review.factOverrides.map((item) => item.fieldKey));

  return (
    <main className="ag-review-shell ag-review-shell-detail" data-antigravity-review-root>
      <div className="ag-review-detail-topbar">
        <div>
          <p className="eyebrow">Operator review</p>
          <h1>{preview.prospect.businessName}</h1>
          <p>
            {preview.prospect.category ?? "Clinic prospect"} · {preview.prospect.city ?? "Athens"}, {preview.prospect.country ?? "Greece"}
          </p>
        </div>

        <div className="ag-review-inline-row">
          <span className={`ag-review-status-chip ag-review-status-${review.decisionStatus}`}>{review.decisionStatus}</span>
          <span className={`ag-review-mode-chip ag-review-mode-${preview.landingPage.renderingMode}`}>
            {preview.landingPage.renderingMode === "live_demo" ? "Live demo" : "Concept demo"}
          </span>
          <Link className="button button-secondary" href="/antigravity-review">
            Back to queue
          </Link>
        </div>
      </div>

      <div className="ag-review-overview-grid">
        <section className="ag-review-overview card">
          <div className="ag-review-section-heading ag-review-section-heading-compact">
            <div>
              <p className="eyebrow">Clinic info</p>
              <h2>Prospect and demo context</h2>
            </div>
          </div>

          <div className="ag-review-key-value-list">
            <div>
              <span>Website</span>
              {preview.prospect.websiteUrl ? (
                <a href={preview.prospect.websiteUrl} target="_blank" rel="noreferrer">
                  {preview.prospect.websiteUrl}
                </a>
              ) : (
                <strong>Not available</strong>
              )}
            </div>
            <div>
              <span>Demo URL</span>
              <a href={`/antigravity-previews/${preview.campaignSlug}/${preview.prospectSlug}`} target="_blank" rel="noreferrer">
                /antigravity-previews/{preview.campaignSlug}/{preview.prospectSlug}
              </a>
            </div>
            <div>
              <span>Phone</span>
              <strong>{preview.prospect.phone ?? "n/a"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{preview.prospect.visibleEmail ?? "n/a"}</strong>
            </div>
            <div>
              <span>Address</span>
              <strong>{preview.prospect.address ?? "n/a"}</strong>
            </div>
            <div>
              <span>Campaign</span>
              <strong>{preview.campaignSlug}</strong>
            </div>
          </div>
        </section>

        <ReviewActionsPanel
          campaignSlug={preview.campaignSlug}
          prospectSlug={preview.prospectSlug}
          currentDecisionStatus={review.decisionStatus}
          editableFields={getEditableReviewFields()}
          fieldDefaults={fieldDefaults(preview.knowledgePack.structuredJson)}
        />
      </div>

      <div className="ag-review-two-column">
        <section className="card">
          <div className="ag-review-section-heading">
            <div>
              <p className="eyebrow">Current site</p>
              <h2>Screenshot</h2>
            </div>
          </div>

          {preview.screenshotUrls.homepage ? (
            <img
              alt={`${preview.prospect.businessName} current site homepage`}
              className="ag-review-detail-shot"
              src={preview.screenshotUrls.homepage}
            />
          ) : (
            <p className="ag-review-muted">No homepage screenshot was captured for this clinic.</p>
          )}
        </section>

        <section className="card">
          <div className="ag-review-section-heading">
            <div>
              <p className="eyebrow">Grade report</p>
              <h2>Conversion review</h2>
            </div>
          </div>

          {preview.websiteGrade ? (
            <>
              <div className="ag-review-score-grid">
                <div>
                  <span>Overall</span>
                  <strong>{preview.websiteGrade.overallScore}</strong>
                </div>
                <div>
                  <span>Demo opportunity</span>
                  <strong>{preview.websiteGrade.demoOpportunityScore}</strong>
                </div>
                <div>
                  <span>Gate</span>
                  <strong>{preview.websiteGrade.demoOpportunityGate ? "pass" : "fail"}</strong>
                </div>
              </div>

              <p>{preview.websiteGrade.operatorSummary}</p>

              <div className="ag-review-grade-categories">
                {Object.entries(preview.websiteGrade.categoryScores).map(([key, value]) => (
                  <div className="ag-review-grade-card" key={key}>
                    <strong>{key}</strong>
                    <span>{value.score}/100</span>
                    <p>{value.rationale}</p>
                  </div>
                ))}
              </div>

              <div className="ag-review-list-columns">
                <div>
                  <h3>Top weaknesses</h3>
                  <ul>
                    {preview.websiteGrade.topWeaknesses.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Improvement opportunities</h3>
                  <ul>
                    {preview.websiteGrade.topDemoImprovementOpportunities.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="ag-review-muted">Website grade artifact not found.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="ag-review-section-heading">
          <div>
            <p className="eyebrow">Structured extraction</p>
            <h2>Facts, confidence, and original snippets</h2>
          </div>
        </div>

        <div className="ag-review-facts-table">
          <div className="ag-review-facts-header">
            <span>Field</span>
            <span>Value</span>
            <span>Confidence</span>
            <span>Original text</span>
          </div>

          {facts.map((fact, index) => (
            <div className="ag-review-facts-row" key={`${fact.fieldKey}:${index}`}>
              <div>
                <strong>{fact.label}</strong>
                <span className={`ag-review-fact-status ag-review-fact-status-${fact.status}`}>{fact.status}</span>
                {overrideKeys.has(fact.fieldKey) ? <span className="ag-review-override-chip">manual override</span> : null}
              </div>
              <div>
                <p>{fact.value}</p>
                {fact.englishSummary ? <span className="ag-review-muted">{fact.englishSummary}</span> : null}
              </div>
              <div>{Math.round(fact.confidence * 100)}%</div>
              <div>{fact.originalText ? <pre>{fact.originalText}</pre> : <span className="ag-review-muted">n/a</span>}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="ag-review-two-column">
        <section className="card">
          <div className="ag-review-section-heading">
            <div>
              <p className="eyebrow">Knowledge pack</p>
              <h2>Markdown source of truth</h2>
            </div>
          </div>

          <pre className="ag-review-pre">{preview.knowledgePack.markdown}</pre>
        </section>

        <section className="card">
          <div className="ag-review-section-heading">
            <div>
              <p className="eyebrow">Verification</p>
              <h2>Contact and map gate</h2>
            </div>
          </div>

          {preview.contactValidation ? (
            <>
              <div className="ag-review-score-grid">
                <div>
                  <span>Pass</span>
                  <strong>{preview.contactValidation.pass ? "yes" : "no"}</strong>
                </div>
                <div>
                  <span>Recommended mode</span>
                  <strong>{preview.contactValidation.recommendedRenderMode}</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{Math.round(preview.contactValidation.overallConfidence * 100)}%</strong>
                </div>
              </div>

              <p>{preview.contactValidation.operatorSummary}</p>

              <div className="ag-review-list-columns">
                <div>
                  <h3>Blockers</h3>
                  <ul>
                    {preview.contactValidation.blockers.length > 0 ? (
                      preview.contactValidation.blockers.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No blockers</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3>Warnings</h3>
                  <ul>
                    {preview.contactValidation.warnings.length > 0 ? (
                      preview.contactValidation.warnings.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No warnings</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="ag-review-grade-categories">
                {preview.contactValidation.checks.map((check) => (
                  <div className="ag-review-grade-card" key={check.name}>
                    <strong>{check.name}</strong>
                    <span>{Math.round(check.confidence * 100)}%</span>
                    <p>{check.summary}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="ag-review-muted">Verification artifact not found.</p>
          )}
        </section>
      </div>

      <div className="ag-review-two-column">
        <section className="card">
          <div className="ag-review-section-heading">
            <div>
              <p className="eyebrow">Greek outreach</p>
              <h2>Draft set</h2>
            </div>
          </div>

          {preview.outreachDraft ? (
            <div className="ag-review-outreach-stack">
              <div>
                <h3>Subject lines</h3>
                <ul>
                  {preview.outreachDraft.subjectLinesGreek.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Primary email</h3>
                <pre className="ag-review-pre">{preview.outreachDraft.primaryEmailGreek}</pre>
              </div>
              <div>
                <h3>Follow-up</h3>
                <pre className="ag-review-pre">{preview.outreachDraft.followUpEmailGreek}</pre>
              </div>
              <div>
                <h3>Short DM</h3>
                <pre className="ag-review-pre">{preview.outreachDraft.dmGreek}</pre>
              </div>
            </div>
          ) : (
            <p className="ag-review-muted">Outreach draft artifact not found yet.</p>
          )}
        </section>

        <ClinicDemoChatPanel chatbot={preview.landingPage.chatbot} />
      </div>

      <section className="card">
        <div className="ag-review-section-heading">
          <div>
            <p className="eyebrow">Audit trail</p>
            <h2>Edits and decisions</h2>
          </div>
        </div>

        <div className="ag-review-audit-list">
          {review.auditTrail.length > 0 ? (
            [...review.auditTrail].reverse().map((event) => (
              <div className="ag-review-audit-item" key={event.eventId}>
                <div>
                  <strong>{event.action}</strong>
                  <span>{event.actor}</span>
                </div>
                <time>{new Date(event.createdAt).toLocaleString("el-GR")}</time>
                {event.note ? <p>{event.note}</p> : null}
              </div>
            ))
          ) : (
            <p className="ag-review-muted">No review events yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
