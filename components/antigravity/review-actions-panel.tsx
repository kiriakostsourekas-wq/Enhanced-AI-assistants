"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewDecisionStatus } from "@/lib/antigravity/schemas";
import type { ReviewFactOverrideValueMode } from "@/lib/antigravity/schemas";

type EditableField = {
  fieldKey: string;
  label: string;
  valueMode: ReviewFactOverrideValueMode;
};

type ReviewActionsPanelProps = {
  campaignSlug: string;
  prospectSlug: string;
  currentDecisionStatus: ReviewDecisionStatus;
  editableFields: EditableField[];
  fieldDefaults: Record<string, string>;
};

export function ReviewActionsPanel({
  campaignSlug,
  prospectSlug,
  currentDecisionStatus,
  editableFields,
  fieldDefaults,
}: ReviewActionsPanelProps) {
  const router = useRouter();
  const [operator, setOperator] = useState("local_operator");
  const [note, setNote] = useState("");
  const [selectedField, setSelectedField] = useState(editableFields[0]?.fieldKey ?? "");
  const [valueText, setValueText] = useState(selectedField ? fieldDefaults[selectedField] ?? "" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedField) {
      setValueText("");
      return;
    }

    setValueText(fieldDefaults[selectedField] ?? "");
  }, [fieldDefaults, selectedField]);

  const selectedFieldConfig = editableFields.find((field) => field.fieldKey === selectedField);

  async function submitAction(payload: Record<string, unknown>) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/antigravity-review/${campaignSlug}/${prospectSlug}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          operator,
          note: note.trim() || undefined,
          ...payload,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Η ενέργεια δεν ολοκληρώθηκε.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Κάτι πήγε στραβά.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ag-review-actions card">
      <div className="ag-review-section-heading">
        <div>
          <p className="eyebrow">Review actions</p>
          <h2>Απόφαση, διορθώσεις και regeneration</h2>
        </div>
        <span className={`ag-review-status-chip ag-review-status-${currentDecisionStatus}`}>{currentDecisionStatus}</span>
      </div>

      <p className="ag-review-muted">
        Δεν υπάρχει δυνατότητα αποστολής από αυτή την οθόνη. Το workflow σταματά σε human review μέχρι να υπάρξει ξεχωριστή
        approval/send αρχιτεκτονική.
      </p>

      <div className="ag-review-action-grid">
        <label className="ag-review-field">
          <span>Operator</span>
          <input value={operator} onChange={(event) => setOperator(event.target.value)} />
        </label>

        <label className="ag-review-field ag-review-field-wide">
          <span>Σημείωση απόφασης / audit note</span>
          <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      <div className="ag-review-button-row">
        <button className="button button-primary" disabled={isSubmitting} onClick={() => void submitAction({ action: "approve_for_outreach" })} type="button">
          Approve for outreach
        </button>
        <button className="button button-secondary" disabled={isSubmitting} onClick={() => void submitAction({ action: "reject" })} type="button">
          Reject
        </button>
        <button className="button button-secondary" disabled={isSubmitting} onClick={() => void submitAction({ action: "mark_do_not_contact" })} type="button">
          Mark do-not-contact
        </button>
      </div>

      <div className="ag-review-regenerate-row">
        <button className="button button-primary" disabled={isSubmitting} onClick={() => void submitAction({ action: "regenerate_demo" })} type="button">
          Regenerate demo
        </button>
        <button className="button button-secondary" disabled={isSubmitting} onClick={() => void submitAction({ action: "regenerate_outreach" })} type="button">
          Regenerate outreach
        </button>
      </div>

      <div className="ag-review-edit-shell">
        <div className="ag-review-section-heading ag-review-section-heading-compact">
          <div>
            <p className="eyebrow">Edit facts</p>
            <h3>Γρήγορο override και άμεσο rebuild</h3>
          </div>
        </div>

        <div className="ag-review-action-grid">
          <label className="ag-review-field">
            <span>Field</span>
            <select value={selectedField} onChange={(event) => setSelectedField(event.target.value)}>
              {editableFields.map((field) => (
                <option key={field.fieldKey} value={field.fieldKey}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>

          <label className="ag-review-field ag-review-field-wide">
            <span>{selectedFieldConfig?.valueMode === "list" ? "Τιμή ανά γραμμή" : "Νέα τιμή"}</span>
            <textarea
              rows={selectedFieldConfig?.valueMode === "list" ? 6 : 4}
              value={valueText}
              onChange={(event) => setValueText(event.target.value)}
            />
          </label>
        </div>

        <button
          className="button button-primary"
          disabled={isSubmitting || !selectedField || !valueText.trim()}
          onClick={() =>
            void submitAction({
              action: "edit_fact",
              fieldKey: selectedField,
              valueText,
              valueMode: selectedFieldConfig?.valueMode,
            })
          }
          type="button"
        >
          Save fact override
        </button>
      </div>

      {error ? <p className="ag-review-error">{error}</p> : null}
    </section>
  );
}
