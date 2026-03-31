import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import {
  ContactValidationSchema,
  ReviewAuditActionSchema,
  ReviewFactOverrideSchema,
  ReviewFactOverrideValueModeSchema,
  ReviewRecordSchema,
  StructuredBusinessDataSchema,
} from "@/lib/antigravity/schemas";
import type {
  ContactValidation,
  ExtractedFact,
  ReviewAuditAction,
  ReviewFactOverride,
  ReviewFactOverrideValueMode,
  ReviewRecord,
  StructuredBusinessData,
  StructuredClinicField,
} from "@/lib/antigravity/schemas";
import { buildDemoChatbotConfig } from "@/lib/antigravity/chatbot/build-demo-chatbot-config";
import { buildClinicDemoLandingPage } from "@/lib/antigravity/demo-site/build-clinic-demo-page";
import { buildAthensClinicKnowledgePack } from "@/lib/antigravity/extraction/knowledge-pack";
import { detectLanguageCode } from "@/lib/antigravity/extraction/language";
import { buildAthensClinicOutreachDraft } from "@/lib/antigravity/outreach/athens-clinic-outreach-drafts";
import { loadReviewPreviewArtifacts } from "@/lib/antigravity/review/review-artifacts";
import { buildFactSource, nowIso, slugify } from "@/lib/antigravity/runtime/utils";
import { verifyAthensClinicContactsAndMap } from "@/lib/antigravity/verification/athens-clinic-contact-map-verifier";

const REVIEW_ROOT = path.join(process.cwd(), "artifacts", "antigravity-review");

type EditableFieldConfig = {
  fieldKey: string;
  label: string;
  valueMode: ReviewFactOverrideValueMode;
};

const EDITABLE_FIELD_CONFIGS: EditableFieldConfig[] = [
  { fieldKey: "clinicName", label: "Clinic name", valueMode: "scalar" },
  { fieldKey: "clinicCategory", label: "Clinic category / specialty", valueMode: "scalar" },
  { fieldKey: "coreServices", label: "Core services / treatments", valueMode: "list" },
  { fieldKey: "address", label: "Address", valueMode: "scalar" },
  { fieldKey: "neighborhood", label: "Neighborhood / Athens area", valueMode: "scalar" },
  { fieldKey: "phoneNumbers", label: "Phone numbers", valueMode: "list" },
  { fieldKey: "emails", label: "Email addresses", valueMode: "list" },
  { fieldKey: "contactPageUrl", label: "Contact page URL", valueMode: "scalar" },
  { fieldKey: "bookingUrl", label: "Appointment / booking URL", valueMode: "scalar" },
  { fieldKey: "openingHours", label: "Opening hours", valueMode: "list" },
  { fieldKey: "doctorNames", label: "Doctor names", valueMode: "list" },
  { fieldKey: "teamNames", label: "Team names", valueMode: "list" },
  { fieldKey: "yearsOfExperience", label: "Years of experience", valueMode: "scalar" },
  { fieldKey: "qualificationsAndSpecialties", label: "Qualifications / specialties", valueMode: "list" },
  { fieldKey: "clinicStory", label: "Clinic story / about us", valueMode: "scalar" },
  { fieldKey: "testimonials", label: "Testimonials", valueMode: "list" },
  { fieldKey: "trustMarkers", label: "Trust markers", valueMode: "list" },
];

export const ReviewActionInputSchema = z.object({
  action: ReviewAuditActionSchema,
  operator: z.string().trim().min(1).default("local_operator"),
  note: z.string().trim().min(1).optional(),
  fieldKey: z.string().trim().min(1).optional(),
  valueText: z.string().trim().min(1).optional(),
  valueMode: ReviewFactOverrideValueModeSchema.optional(),
});

function getReviewRecordPath(campaignSlug: string, prospectSlug: string) {
  return path.join(REVIEW_ROOT, campaignSlug, prospectSlug, "review-state.json");
}

async function writeJsonFile(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function fieldToFact(field: StructuredClinicField): ExtractedFact | null {
  if (field.status === "unresolved" || field.value === undefined) {
    return null;
  }

  return {
    key: field.key,
    label: field.label,
    value: field.value,
    confidence: field.confidence,
    provenance: field.provenance,
  };
}

function matchesOverrideField(fieldKey: string, structuredKey: string) {
  const normalizedStructuredKey = structuredKey.replace(/:[^:]+$/, "");

  switch (fieldKey) {
    case "clinicName":
      return normalizedStructuredKey === "clinic_name";
    case "clinicCategory":
      return normalizedStructuredKey === "clinic_category";
    case "coreServices":
      return normalizedStructuredKey === "core_services" || normalizedStructuredKey === "service";
    case "phoneNumbers":
      return normalizedStructuredKey === "phone" || normalizedStructuredKey === "phone_numbers";
    case "emails":
      return normalizedStructuredKey === "email" || normalizedStructuredKey === "emails";
    case "contactPageUrl":
      return normalizedStructuredKey === "contact_page_url";
    case "bookingUrl":
      return normalizedStructuredKey === "booking_url";
    case "openingHours":
      return normalizedStructuredKey === "opening_hours";
    case "doctorNames":
      return normalizedStructuredKey === "doctor_name" || normalizedStructuredKey === "doctor_names";
    case "teamNames":
      return normalizedStructuredKey === "team_name" || normalizedStructuredKey === "team_names";
    case "yearsOfExperience":
      return normalizedStructuredKey === "years_of_experience";
    case "qualificationsAndSpecialties":
      return normalizedStructuredKey === "qualification" || normalizedStructuredKey === "qualifications_and_specialties";
    case "clinicStory":
      return normalizedStructuredKey === "clinic_story";
    case "testimonials":
      return normalizedStructuredKey === "testimonial" || normalizedStructuredKey === "testimonials";
    case "trustMarkers":
      return normalizedStructuredKey === "trust_marker" || normalizedStructuredKey === "trust_markers";
    default:
      return normalizedStructuredKey === fieldKey;
  }
}

function getEditableFieldConfig(fieldKey: string) {
  return EDITABLE_FIELD_CONFIGS.find((field) => field.fieldKey === fieldKey);
}

function parseOverrideValues(override: ReviewFactOverride) {
  if (override.valueMode === "list") {
    return override.valueText
      .split(/\n+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return override.valueText.trim();
}

function makeManualField(args: {
  key: string;
  label: string;
  value: string;
  actor: string;
  note?: string;
  blockerForLiveDemo?: boolean;
}): StructuredClinicField {
  return {
    key: args.key,
    label: args.label,
    status: "verified_fact",
    value: args.value,
    originalText: args.value,
    sourceLanguage: detectLanguageCode(args.value),
    confidence: 0.99,
    blockerForLiveDemo: args.blockerForLiveDemo ?? false,
    provenance: [
      buildFactSource({
        sourceType: "manual_review",
        label: args.label,
        uri: `manual-review:${slugify(args.key)}`,
        excerpt: args.note,
      }),
    ],
  };
}

function makeManualListFields(args: {
  keyPrefix: string;
  label: string;
  values: string[];
  actor: string;
  note?: string;
  blockerForLiveDemo?: boolean;
}) {
  return args.values.map((value) =>
    makeManualField({
      key: `${args.keyPrefix}:${slugify(value) || randomUUID().slice(0, 8)}`,
      label: args.label,
      value,
      actor: args.actor,
      note: args.note,
      blockerForLiveDemo: args.blockerForLiveDemo,
    }),
  );
}

function applyOverrideToStructuredExtraction(args: {
  businessData: StructuredBusinessData;
  override: ReviewFactOverride;
}): StructuredBusinessData {
  const { businessData, override } = args;
  const extraction = structuredClone(businessData.structuredExtraction);
  const parsedValue = parseOverrideValues(override);
  const actor = override.updatedBy;
  const note = override.note;

  switch (override.fieldKey) {
    case "clinicName":
      extraction.clinicName = makeManualField({
        key: "clinic_name",
        label: "Clinic name",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "clinicCategory":
      extraction.clinicCategory = makeManualField({
        key: "clinic_category",
        label: "Clinic category / specialty",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "coreServices":
      extraction.coreServices = makeManualListFields({
        keyPrefix: "service",
        label: "Core service / treatment",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "address":
      extraction.address = makeManualField({
        key: "address",
        label: "Address",
        value: parsedValue as string,
        actor,
        note,
        blockerForLiveDemo: true,
      });
      break;
    case "neighborhood":
      extraction.neighborhood = makeManualField({
        key: "neighborhood",
        label: "Neighborhood / Athens area",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "phoneNumbers":
      extraction.phoneNumbers = makeManualListFields({
        keyPrefix: "phone",
        label: "Phone number",
        values: parsedValue as string[],
        actor,
        note,
        blockerForLiveDemo: true,
      });
      break;
    case "emails":
      extraction.emails = makeManualListFields({
        keyPrefix: "email",
        label: "Email address",
        values: parsedValue as string[],
        actor,
        note,
        blockerForLiveDemo: true,
      });
      break;
    case "contactPageUrl":
      extraction.contactPageUrl = makeManualField({
        key: "contact_page_url",
        label: "Contact page URL",
        value: parsedValue as string,
        actor,
        note,
        blockerForLiveDemo: true,
      });
      break;
    case "bookingUrl":
      extraction.bookingUrl = makeManualField({
        key: "booking_url",
        label: "Appointment / booking URL",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "openingHours":
      extraction.openingHours = makeManualListFields({
        keyPrefix: "opening_hours",
        label: "Opening hours",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "doctorNames":
      extraction.doctorNames = makeManualListFields({
        keyPrefix: "doctor_name",
        label: "Doctor name",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "teamNames":
      extraction.teamNames = makeManualListFields({
        keyPrefix: "team_name",
        label: "Team name",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "yearsOfExperience":
      extraction.yearsOfExperience = makeManualField({
        key: "years_of_experience",
        label: "Years of experience",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "qualificationsAndSpecialties":
      extraction.qualificationsAndSpecialties = makeManualListFields({
        keyPrefix: "qualification",
        label: "Qualification / specialty",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "clinicStory":
      extraction.clinicStory = makeManualField({
        key: "clinic_story",
        label: "Clinic story / about us",
        value: parsedValue as string,
        actor,
        note,
      });
      break;
    case "testimonials":
      extraction.testimonials = makeManualListFields({
        keyPrefix: "testimonial",
        label: "Testimonial",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    case "trustMarkers":
      extraction.trustMarkers = makeManualListFields({
        keyPrefix: "trust_marker",
        label: "Trust marker",
        values: parsedValue as string[],
        actor,
        note,
      });
      break;
    default:
      return businessData;
  }

  extraction.unresolvedFields = extraction.unresolvedFields.filter((field) => {
    return !matchesOverrideField(override.fieldKey, field.key);
  });

  const services = compact(extraction.coreServices.map(fieldToFact));
  const contactFacts = compact([
    ...extraction.phoneNumbers.map(fieldToFact),
    ...extraction.emails.map(fieldToFact),
    fieldToFact(extraction.contactPageUrl),
    fieldToFact(extraction.bookingUrl),
  ]);
  const locationFacts = compact([
    fieldToFact(extraction.address),
    fieldToFact(extraction.neighborhood),
    ...businessData.locationFacts.filter((fact) => fact.key === "maps_url"),
  ]);
  const hoursFacts = compact(extraction.openingHours.map(fieldToFact));
  const bookingSignals = compact([
    extraction.bookingUrl.status !== "unresolved"
      ? {
          key: "booking_signal:booking_page",
          label: "Has booking page",
          value: true,
          confidence: extraction.bookingUrl.confidence,
          provenance: extraction.bookingUrl.provenance,
        }
      : null,
  ]);
  const disclaimerFacts = extraction.unresolvedFields.slice(0, 8).map((field) => ({
    key: `unresolved:${field.key}`,
    label: field.label,
    value: field.englishSummary ?? "Unresolved",
    confidence: field.confidence,
    provenance: field.provenance,
  }));

  return StructuredBusinessDataSchema.parse({
    ...businessData,
    canonicalName:
      fieldToFact(extraction.clinicName) ??
      businessData.canonicalName,
    services,
    bookingSignals,
    contactFacts,
    locationFacts,
    hoursFacts,
    disclaimerFacts,
    structuredExtraction: extraction,
  });
}

function applyOverridesToBusinessData(args: {
  businessData: StructuredBusinessData;
  overrides: ReviewFactOverride[];
}) {
  return args.overrides.reduce(
    (current, override) => applyOverrideToStructuredExtraction({ businessData: current, override }),
    args.businessData,
  );
}

async function readReviewRecord(filePath: string) {
  try {
    const contents = await readFile(filePath, "utf8");
    return ReviewRecordSchema.parse(JSON.parse(contents));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

export async function loadOrCreateReviewRecord(args: { campaignSlug: string; prospectSlug: string }) {
  const filePath = getReviewRecordPath(args.campaignSlug, args.prospectSlug);
  const existing = await readReviewRecord(filePath);

  if (existing) {
    return existing;
  }

  const now = nowIso();
  const initial = ReviewRecordSchema.parse({
    campaignSlug: args.campaignSlug,
    prospectSlug: args.prospectSlug,
    decisionStatus: "pending_review",
    factOverrides: [],
    auditTrail: [],
    createdAt: now,
    updatedAt: now,
  });
  await writeJsonFile(filePath, initial);
  return initial;
}

async function saveReviewRecord(record: ReviewRecord) {
  await writeJsonFile(getReviewRecordPath(record.campaignSlug, record.prospectSlug), record);
}

async function regenerateArtifacts(args: {
  campaignSlug: string;
  prospectSlug: string;
  reviewRecord: ReviewRecord;
}) {
  const preview = await loadReviewPreviewArtifacts({
    campaignSlug: args.campaignSlug,
    prospectSlug: args.prospectSlug,
  });

  if (!preview.businessData || !preview.contactValidation || !preview.websiteGrade) {
    return;
  }

  let businessData = applyOverridesToBusinessData({
    businessData: preview.businessData,
    overrides: args.reviewRecord.factOverrides,
  });
  const contactValidation = ContactValidationSchema.parse(
    verifyAthensClinicContactsAndMap({
      prospect: preview.prospect,
      businessData,
      snapshot: preview.crawl?.siteSnapshot,
      mapsEmbedApiKey: process.env.GOOGLE_MAPS_EMBED_API_KEY,
    }),
  );

  businessData = StructuredBusinessDataSchema.parse({
    ...businessData,
    structuredExtraction: {
      ...businessData.structuredExtraction,
      liveDemoEligibility: {
        eligible: contactValidation.liveDemoEligibility,
        confidence: contactValidation.overallConfidence,
        blockers: contactValidation.blockers,
        rationale: contactValidation.operatorSummary,
      },
    },
  });

  const knowledgePack = buildAthensClinicKnowledgePack({
    businessData,
    provenanceUri: preview.prospect.websiteUrl ?? preview.prospect.mapsUrl ?? `prospect:${preview.prospect.prospectId}`,
  });
  const chatbotConfig = buildDemoChatbotConfig({
    prospect: preview.prospect,
    knowledgePack,
    businessData,
    contactValidation,
  });
  const landingPage = buildClinicDemoLandingPage({
    campaignId: preview.campaignSlug,
    prospect: preview.prospect,
    knowledgePack,
    websiteGrade: preview.websiteGrade,
    chatbotConfig,
    contactValidation,
  });
  const outreachDraft = preview.outreachDraft
    ? {
        ...preview.outreachDraft,
        ...buildAthensClinicOutreachDraft({
          prospect: preview.prospect,
          knowledgePack,
          websiteGrade: preview.websiteGrade,
          landingPage,
          previewDeployment: {
            status: "deployed",
            previewUrl: publicPreviewUrl(preview),
            artifactDirectory: preview.artifactDirectory,
            deployedAt: nowIso(),
            provenance: preview.landingPage.provenance,
          },
          contactValidation,
        }),
      }
    : undefined;

  await Promise.all([
    writeJsonFile(path.join(preview.artifactDirectory, "business-data.json"), businessData),
    writeJsonFile(path.join(preview.artifactDirectory, "knowledge-pack.json"), knowledgePack),
    writeJsonFile(path.join(preview.artifactDirectory, "contact-validation.json"), contactValidation),
    writeJsonFile(path.join(preview.artifactDirectory, "chatbot-config.json"), chatbotConfig),
    writeJsonFile(path.join(preview.artifactDirectory, "landing-page.json"), landingPage),
    outreachDraft ? writeJsonFile(path.join(preview.artifactDirectory, "outreach-draft.json"), outreachDraft) : Promise.resolve(),
  ]);
}

function publicPreviewUrl(preview: Awaited<ReturnType<typeof loadReviewPreviewArtifacts>>) {
  const baseUrl = (process.env.ANTIGRAVITY_PREVIEW_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  return `${baseUrl}/antigravity-previews/${preview.campaignSlug}/${preview.prospectSlug}`;
}

function appendAuditEvent(args: {
  record: ReviewRecord;
  action: ReviewAuditAction;
  actor: string;
  note?: string;
  details?: unknown;
}) {
  const now = nowIso();

  return ReviewRecordSchema.parse({
    ...args.record,
    updatedAt: now,
    auditTrail: [
      ...args.record.auditTrail,
      {
        eventId: randomUUID(),
        action: args.action,
        actor: args.actor,
        note: args.note,
        details: args.details,
        createdAt: now,
      },
    ],
  });
}

export async function performReviewAction(args: {
  campaignSlug: string;
  prospectSlug: string;
  input: z.infer<typeof ReviewActionInputSchema>;
}) {
  const input = ReviewActionInputSchema.parse(args.input);
  let record = await loadOrCreateReviewRecord({
    campaignSlug: args.campaignSlug,
    prospectSlug: args.prospectSlug,
  });

  switch (input.action) {
    case "approve_for_outreach":
      record = appendAuditEvent({
        record: {
          ...record,
          decisionStatus: "approved_for_outreach",
          decisionNote: input.note,
        },
        action: input.action,
        actor: input.operator,
        note: input.note,
      });
      await saveReviewRecord(record);
      return record;
    case "reject":
      record = appendAuditEvent({
        record: {
          ...record,
          decisionStatus: "rejected",
          decisionNote: input.note,
        },
        action: input.action,
        actor: input.operator,
        note: input.note,
      });
      await saveReviewRecord(record);
      return record;
    case "mark_do_not_contact":
      record = appendAuditEvent({
        record: {
          ...record,
          decisionStatus: "do_not_contact",
          decisionNote: input.note,
        },
        action: input.action,
        actor: input.operator,
        note: input.note,
      });
      await saveReviewRecord(record);
      return record;
    case "edit_fact": {
      if (!input.fieldKey || !input.valueText) {
        throw new Error("fieldKey and valueText are required for edit_fact.");
      }

      const config = getEditableFieldConfig(input.fieldKey);
      if (!config) {
        throw new Error(`Unsupported review field: ${input.fieldKey}`);
      }

      const override = ReviewFactOverrideSchema.parse({
        overrideId: randomUUID(),
        fieldKey: config.fieldKey,
        label: config.label,
        valueMode: input.valueMode ?? config.valueMode,
        valueText: input.valueText,
        note: input.note,
        updatedBy: input.operator,
        updatedAt: nowIso(),
      });

      record = appendAuditEvent({
        record: {
          ...record,
          factOverrides: [
            ...record.factOverrides.filter((item) => item.fieldKey !== config.fieldKey),
            override,
          ],
          decisionStatus: "pending_review",
        },
        action: input.action,
        actor: input.operator,
        note: input.note,
        details: {
          fieldKey: config.fieldKey,
          valueMode: override.valueMode,
        },
      });
      await saveReviewRecord(record);
      await regenerateArtifacts({
        campaignSlug: args.campaignSlug,
        prospectSlug: args.prospectSlug,
        reviewRecord: record,
      });
      return record;
    }
    case "regenerate_demo":
    case "regenerate_outreach":
      record = appendAuditEvent({
        record,
        action: input.action,
        actor: input.operator,
        note: input.note,
      });
      await saveReviewRecord(record);
      await regenerateArtifacts({
        campaignSlug: args.campaignSlug,
        prospectSlug: args.prospectSlug,
        reviewRecord: record,
      });
      return record;
    default:
      return record;
  }
}

export function getEditableReviewFields() {
  return EDITABLE_FIELD_CONFIGS;
}
