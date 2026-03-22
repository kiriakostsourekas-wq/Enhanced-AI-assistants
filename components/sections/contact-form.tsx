"use client";

import { FormEvent, useEffect, useState } from "react";

import { siteConfig } from "@/lib/site-content";

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

const initialForm: FormState = {
  name: "",
  business: "",
  email: "",
  phone: "",
  industry: "Clinic",
  websiteStatus: "Existing website, needs improvement",
  monthlyLeads: "10-30 leads",
  notes: "",
};

const storageKey = "northline-demo-submissions";

export function ContactForm() {
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
      submittedAt: new Intl.DateTimeFormat("en-US", {
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
            <p className="panel-label">Request a tailored walkthrough</p>
            <h3>Book a demo</h3>
          </div>
          <span className="form-badge">Demo-ready</span>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>Name</span>
            <input
              className="form-input"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Jordan Smith"
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="form-field">
            <span>Business</span>
            <input
              className="form-input"
              onChange={(event) => updateField("business", event.target.value)}
              placeholder="North Peak Dental"
              required
              type="text"
              value={form.business}
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              className="form-input"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@business.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="form-field">
            <span>Phone</span>
            <input
              className="form-input"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={form.phone}
            />
          </label>

          <label className="form-field">
            <span>Industry</span>
            <select
              className="form-input"
              onChange={(event) => updateField("industry", event.target.value)}
              value={form.industry}
            >
              <option>Clinic</option>
              <option>Dentist</option>
              <option>Med Spa</option>
              <option>Salon</option>
              <option>Consulting</option>
              <option>Home Services</option>
            </select>
          </label>

          <label className="form-field">
            <span>Current website status</span>
            <select
              className="form-input"
              onChange={(event) => updateField("websiteStatus", event.target.value)}
              value={form.websiteStatus}
            >
              <option>Existing website, needs improvement</option>
              <option>No real website yet</option>
              <option>Website is fine, need better lead capture</option>
            </select>
          </label>

          <label className="form-field">
            <span>Approximate monthly leads</span>
            <select
              className="form-input"
              onChange={(event) => updateField("monthlyLeads", event.target.value)}
              value={form.monthlyLeads}
            >
              <option>0-10 leads</option>
              <option>10-30 leads</option>
              <option>30-75 leads</option>
              <option>75+ leads</option>
            </select>
          </label>

          <label className="form-field form-field-wide">
            <span>What would you want the assistant to handle?</span>
            <textarea
              className="form-input form-textarea"
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Example: answer treatment questions, qualify leads, offer appointment times, and alert our front desk."
              rows={5}
              value={form.notes}
            />
          </label>
        </div>

        <div className="form-actions">
          <a className="button button-primary" href={siteConfig.primaryCta.href}>
            Book Instantly on Calendly
          </a>
          <button className="button button-secondary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving demo request..." : "Submit Demo Request"}
          </button>
          <p className="form-note">
            The calendar button opens live booking. The form below is a separate local inquiry flow
            stored in your browser for demo purposes.
          </p>
        </div>
      </form>

      <div className="contact-sidebar">
        <div className="card submission-card">
          <p className="panel-label">Instant booking</p>
          <h3>Prefer to schedule right away?</h3>
          <p>Use the live calendar to choose a time immediately.</p>
          <div className="submission-meta">
            <span>30-minute call</span>
            <span>Calendly</span>
          </div>
          <a className="button button-primary" href={siteConfig.primaryCta.href}>
            Open Calendar
          </a>
        </div>

        <div className="card submission-card">
          <p className="panel-label">Latest saved request</p>
          {latestSubmission ? (
            <>
              <h3>{latestSubmission.business}</h3>
              <p>
                {latestSubmission.name} requested a demo for a {latestSubmission.industry.toLowerCase()}{" "}
                business on {latestSubmission.submittedAt}.
              </p>
              <div className="submission-meta">
                <span>{latestSubmission.websiteStatus}</span>
                <span>{latestSubmission.monthlyLeads}</span>
              </div>
            </>
          ) : (
            <>
              <h3>No submission yet</h3>
              <p>Use the form to simulate a real enquiry and review the saved confirmation here.</p>
            </>
          )}
        </div>

        <div className="card submission-card">
          <p className="panel-label">Recent saved requests</p>
          <div className="submission-list">
            {savedSubmissions.length > 0 ? (
              savedSubmissions.map((submission) => (
                <div className="submission-list-item" key={submission.id}>
                  <strong>{submission.business}</strong>
                  <span>
                    {submission.industry} · {submission.monthlyLeads}
                  </span>
                </div>
              ))
            ) : (
              <p>No stored requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
