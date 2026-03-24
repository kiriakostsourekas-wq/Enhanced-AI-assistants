"use client";

import { FormEvent, useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/site-content";

type DemoSubmission = {
  id: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  industry: string;
  websiteStatus: string;
  monthlyLeads: string;
  notes: string;
  submittedAt: string;
};

type FormState = Omit<DemoSubmission, "id" | "submittedAt">;

const storageKey = "northline-demo-submissions";

type ContactFormProps = {
  content: SiteContent["contactForm"];
  locale: Locale;
  primaryCtaHref: string;
};

function resolveOptionLabel(options: readonly { label: string; value: string }[], value: string) {
  return options.find((option) => option.value === value)?.label || value;
}

function fillTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

export function ContactForm({ content, locale, primaryCtaHref }: ContactFormProps) {
  const initialForm: FormState = {
    name: "",
    business: "",
    email: "",
    phone: "",
    industry: content.selectOptions.industries[0]?.value || "clinic",
    websiteStatus: content.selectOptions.websiteStatus[0]?.value || "existing-needs-improvement",
    monthlyLeads: content.selectOptions.monthlyLeads[1]?.value || "10-30",
    notes: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [savedSubmissions, setSavedSubmissions] = useState<DemoSubmission[]>([]);
  const [latestSubmission, setLatestSubmission] = useState<DemoSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as DemoSubmission[];
      setSavedSubmissions(parsed);
      setLatestSubmission(parsed[0] ?? null);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => window.setTimeout(resolve, 800));

    const submission: DemoSubmission = {
      id: Date.now(),
      ...form,
      submittedAt: new Intl.DateTimeFormat(locale === "gr" ? "el-GR" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    };

    const nextSubmissions = [submission, ...savedSubmissions].slice(0, 4);

    window.localStorage.setItem(storageKey, JSON.stringify(nextSubmissions));
    setSavedSubmissions(nextSubmissions);
    setLatestSubmission(submission);
    setForm(initialForm);
    setIsSubmitting(false);
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="contact-grid">
      <form className="contact-form card" onSubmit={handleSubmit}>
        <div className="form-heading">
          <div>
            <p className="panel-label">{content.panel.label}</p>
            <h3>{content.panel.title}</h3>
          </div>
          <span className="form-badge">{content.panel.badge}</span>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>{content.fields.name}</span>
            <input
              className="form-input"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder={content.placeholders.name}
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="form-field">
            <span>{content.fields.business}</span>
            <input
              className="form-input"
              onChange={(event) => updateField("business", event.target.value)}
              placeholder={content.placeholders.business}
              required
              type="text"
              value={form.business}
            />
          </label>

          <label className="form-field">
            <span>{content.fields.email}</span>
            <input
              className="form-input"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder={content.placeholders.email}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="form-field">
            <span>{content.fields.phone}</span>
            <input
              className="form-input"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder={content.placeholders.phone}
              type="tel"
              value={form.phone}
            />
          </label>

          <label className="form-field">
            <span>{content.fields.industry}</span>
            <select
              className="form-input"
              onChange={(event) => updateField("industry", event.target.value)}
              value={form.industry}
            >
              {content.selectOptions.industries.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>{content.fields.websiteStatus}</span>
            <select
              className="form-input"
              onChange={(event) => updateField("websiteStatus", event.target.value)}
              value={form.websiteStatus}
            >
              {content.selectOptions.websiteStatus.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>{content.fields.monthlyLeads}</span>
            <select
              className="form-input"
              onChange={(event) => updateField("monthlyLeads", event.target.value)}
              value={form.monthlyLeads}
            >
              {content.selectOptions.monthlyLeads.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field form-field-wide">
            <span>{content.fields.notes}</span>
            <textarea
              className="form-input form-textarea"
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder={content.placeholders.notes}
              rows={5}
              value={form.notes}
            />
          </label>
        </div>

        <div className="form-actions">
          <a className="button button-primary" href={primaryCtaHref}>
            {content.actions.calendarButtonLabel}
          </a>
          <button className="button button-secondary" disabled={isSubmitting} type="submit">
            {isSubmitting ? content.actions.savingLabel : content.actions.submitLabel}
          </button>
          <p className="form-note">{content.actions.note}</p>
        </div>
      </form>

      <div className="contact-sidebar">
        <div className="card submission-card">
          <p className="panel-label">{content.quickBooking.label}</p>
          <h3>{content.quickBooking.title}</h3>
          <p>{content.quickBooking.description}</p>
          <div className="submission-meta">
            <span>{content.quickBooking.metaDuration}</span>
            <span>{content.quickBooking.metaProvider}</span>
          </div>
          <a className="button button-primary" href={primaryCtaHref}>
            {content.quickBooking.buttonLabel}
          </a>
        </div>

        <div className="card submission-card">
          <p className="panel-label">{content.latestRequest.panelLabel}</p>
          {latestSubmission ? (
            <>
              <h3>{latestSubmission.business}</h3>
              <p>
                {fillTemplate(content.latestRequest.summaryTemplate, {
                  industry: resolveOptionLabel(content.selectOptions.industries, latestSubmission.industry).toLowerCase(),
                  name: latestSubmission.name,
                  submittedAt: latestSubmission.submittedAt,
                })}
              </p>
              <div className="submission-meta">
                <span>
                  {resolveOptionLabel(content.selectOptions.websiteStatus, latestSubmission.websiteStatus)}
                </span>
                <span>
                  {resolveOptionLabel(content.selectOptions.monthlyLeads, latestSubmission.monthlyLeads)}
                </span>
              </div>
            </>
          ) : (
            <>
              <h3>{content.latestRequest.emptyTitle}</h3>
              <p>{content.latestRequest.emptyDescription}</p>
            </>
          )}
        </div>

        <div className="card submission-card">
          <p className="panel-label">{content.recentRequests.panelLabel}</p>
          <div className="submission-list">
            {savedSubmissions.length > 0 ? (
              savedSubmissions.map((submission) => (
                <div className="submission-list-item" key={submission.id}>
                  <strong>{submission.business}</strong>
                  <span>
                    {resolveOptionLabel(content.selectOptions.industries, submission.industry)} ·{" "}
                    {resolveOptionLabel(content.selectOptions.monthlyLeads, submission.monthlyLeads)}
                  </span>
                </div>
              ))
            ) : (
              <p>{content.recentRequests.emptyLabel}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
