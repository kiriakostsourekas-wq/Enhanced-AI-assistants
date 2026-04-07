import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { parseCsv } from "@/lib/antigravity/discovery/csv";
import { extractAthensClinicBusinessData } from "@/lib/antigravity/extraction/athens-clinic-extractor";
import { createAntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";
import { createSiteSnapshot } from "@/lib/antigravity/site-snapshot";
import { DiscoveredProspectSchema, FactSourceSchema, SiteSnapshotSchema } from "@/lib/antigravity/schemas";
import type { FactSource, SiteSnapshot } from "@/lib/antigravity/schemas";
import { getTemplateBySlug, matchTemplateSlug, type TemplateCatalogEntry } from "@/lib/demo-library/template-catalog";

const LEADS_CSV_PATH = path.join(process.cwd(), "clinics", "athens_clinics_leads.csv");
const PROFILE_OUTPUT_ROOT = path.join(process.cwd(), "artifacts", "clinic-demo-profiles");
const EXCLUDED_HOST_PATTERNS = [
  /google\.com$/i,
  /instagram\.com$/i,
  /facebook\.com$/i,
  /linkedin\.com$/i,
  /x\.com$/i,
  /twitter\.com$/i,
  /wixsite\.com$/i,
];

const ClinicLeadRowSchema = z.object({
  business_name: z.string().trim().min(1),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  official_website: z.string().trim().optional(),
  resolved_website: z.string().trim().optional(),
  address: z.string().trim().optional(),
  rating: z.string().trim().optional(),
  reviews_count: z.string().trim().optional(),
  category: z.string().trim().optional(),
  google_maps_url: z.string().trim().optional(),
  snapshot_status: z.string().trim().optional(),
  snapshot_artifact_directory: z.string().trim().optional(),
  snapshot_primary_phone: z.string().trim().optional(),
  snapshot_primary_email: z.string().trim().optional(),
  snapshot_primary_address: z.string().trim().optional(),
});

type ClinicLeadRow = z.infer<typeof ClinicLeadRowSchema>;

export type ClinicLeadSummary = {
  rowIndex: number;
  rowId: string;
  slug: string;
  businessName: string;
  category?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviewsCount?: number;
  snapshotStatus?: string;
  snapshotArtifactDirectory?: string;
  templateSlug: string;
};

export type ClinicDemoProfile = {
  slug: string;
  businessName: string;
  category?: string;
  template: TemplateCatalogEntry;
  summary: string;
  heroHeading: string;
  heroSubheading: string;
  websiteUrl?: string;
  mapsUrl?: string;
  address?: string;
  rating?: number;
  reviewsCount?: number;
  snapshotStatus?: string;
  contactItems: Array<{ label: string; value: string; href?: string }>;
  services: string[];
  bookingSignals: string[];
  trustMarkers: string[];
  people: string[];
  unresolvedItems: string[];
  liveDemoEligibility: {
    eligible: boolean;
    rationale: string;
    blockers: string[];
  };
  overlayChips: string[];
  overlayServices: string[];
  sourceFacts: FactSource[];
};

let clinicLeadsPromise: Promise<ClinicLeadSummary[]> | null = null;
let savedProfileSlugsPromise: Promise<Set<string>> | null = null;

const StoredClinicDemoProfileSchema = z.object({
  slug: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  category: z.string().trim().optional(),
  template: z.object({ slug: z.string().trim().min(1) }).passthrough(),
  summary: z.string().trim().min(1),
  heroHeading: z.string().trim().min(1),
  heroSubheading: z.string().trim().min(1),
  websiteUrl: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  address: z.string().trim().optional(),
  rating: z.number().optional(),
  reviewsCount: z.number().optional(),
  snapshotStatus: z.string().trim().optional(),
  contactItems: z.array(
    z.object({
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
      href: z.string().trim().min(1).optional(),
    }),
  ),
  services: z.array(z.string()),
  bookingSignals: z.array(z.string()),
  trustMarkers: z.array(z.string()),
  people: z.array(z.string()),
  unresolvedItems: z.array(z.string()),
  liveDemoEligibility: z.object({
    eligible: z.boolean(),
    rationale: z.string().trim().min(1),
    blockers: z.array(z.string()),
  }),
  overlayChips: z.array(z.string()),
  overlayServices: z.array(z.string()),
  sourceFacts: z.array(FactSourceSchema),
});

function validOptionalUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
}

function validOptionalEmail(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed.toLowerCase() : undefined;
}

function parseNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = Number(value.replace(/[^\d.]+/g, ""));
  return Number.isFinite(normalized) ? normalized : undefined;
}

function normalizeSelector(value: string) {
  return value.trim().toLowerCase();
}

function safeDomain(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./i, "");
  } catch {
    return undefined;
  }
}

function looksLikeExcludedHost(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./i, "");
  return EXCLUDED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function pickWebsiteUrl(row: ClinicLeadRow) {
  const candidates = [row.official_website, row.resolved_website, row.website]
    .map(validOptionalUrl)
    .filter(Boolean) as string[];

  return candidates.find((candidate) => !looksLikeExcludedHost(candidate));
}

function clinicLeadSlug(row: ClinicLeadRow, rowIndex: number) {
  return slugify(row.business_name) || `athens-clinic-${rowIndex + 1}`;
}

function clinicLeadRowId(rowIndex: number) {
  return `athens-clinic-${rowIndex + 1}`;
}

function clinicLeadTokens(lead: ClinicLeadSummary) {
  return new Set(
    [
      String(lead.rowIndex + 1),
      lead.rowId,
      `row:${lead.rowIndex + 1}`,
      lead.slug,
      normalizeSelector(lead.businessName),
      lead.websiteUrl ? `domain:${safeDomain(lead.websiteUrl)}` : undefined,
      lead.websiteUrl ? safeDomain(lead.websiteUrl) : undefined,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeSelector(value)),
  );
}

async function loadClinicLeadRows(): Promise<ClinicLeadSummary[]> {
  try {
    const raw = await readFile(LEADS_CSV_PATH, "utf8");
    const rows = parseCsv(raw).map((row) => ClinicLeadRowSchema.parse(row));

    return rows
      .map((row, rowIndex) => {
        const websiteUrl = pickWebsiteUrl(row);
        const category = row.category?.trim() || undefined;
        const slug = clinicLeadSlug(row, rowIndex);
        const templateSlug = matchTemplateSlug([category, row.business_name, websiteUrl].filter(Boolean).join(" "));

        return {
          rowIndex,
          rowId: clinicLeadRowId(rowIndex),
          slug,
          businessName: row.business_name,
          category,
          websiteUrl,
          mapsUrl: validOptionalUrl(row.google_maps_url),
          email: validOptionalEmail(row.email) ?? validOptionalEmail(row.snapshot_primary_email),
          phone: row.snapshot_primary_phone?.trim() || row.phone?.trim() || undefined,
          address: row.snapshot_primary_address?.trim() || row.address?.trim() || undefined,
          rating: parseNumber(row.rating),
          reviewsCount: parseNumber(row.reviews_count),
          snapshotStatus: row.snapshot_status?.trim() || undefined,
          snapshotArtifactDirectory: row.snapshot_artifact_directory?.trim() || undefined,
          templateSlug,
        } satisfies ClinicLeadSummary;
      })
      .sort((left, right) => {
        const leftWebsiteRank = left.websiteUrl ? 0 : 1;
        const rightWebsiteRank = right.websiteUrl ? 0 : 1;

        return leftWebsiteRank - rightWebsiteRank || (right.reviewsCount ?? 0) - (left.reviewsCount ?? 0);
      });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function listClinicLeadSummaries() {
  if (!clinicLeadsPromise) {
    clinicLeadsPromise = loadClinicLeadRows();
  }

  return clinicLeadsPromise;
}

export async function getClinicLeadSummaryBySlug(leadSlug: string) {
  const leads = await listClinicLeadSummaries();
  return leads.find((lead) => lead.slug === leadSlug);
}

async function readSavedProfileSlugs() {
  try {
    const entries = await readdir(PROFILE_OUTPUT_ROOT, { withFileTypes: true });
    return new Set(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => entry.name.replace(/\.json$/i, "")),
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new Set<string>();
    }

    throw error;
  }
}

export async function listSavedClinicDemoProfileSlugs() {
  if (!savedProfileSlugsPromise) {
    savedProfileSlugsPromise = readSavedProfileSlugs();
  }

  return savedProfileSlugsPromise;
}

export async function hasSavedClinicDemoProfile(leadSlug: string) {
  const slugs = await listSavedClinicDemoProfileSlugs();
  return slugs.has(leadSlug);
}

export async function resolveClinicLeadSelectors(selectors: string[]) {
  const leads = await listClinicLeadSummaries();
  const normalizedSelectors = selectors.map(normalizeSelector).filter(Boolean);

  if (normalizedSelectors.length === 0) {
    return leads;
  }

  return normalizedSelectors.map((selector) => {
    const matches = leads.filter((lead) => clinicLeadTokens(lead).has(selector));

    if (matches.length === 0) {
      throw new Error(`No clinic lead matched selector "${selector}".`);
    }

    if (matches.length > 1) {
      throw new Error(`Clinic lead selector "${selector}" is ambiguous.`);
    }

    return matches[0];
  });
}

function profileSource(lead: ClinicLeadSummary): FactSource {
  return buildFactSource({
    sourceType: "campaign_seed",
    label: "Athens clinic lead",
    uri: lead.websiteUrl ?? lead.mapsUrl ?? `lead:${lead.slug}`,
    excerpt: lead.businessName,
  });
}

async function loadSnapshotForLead(lead: ClinicLeadSummary) {
  if (!lead.snapshotArtifactDirectory) {
    return undefined;
  }

  const snapshotPath = path.join(process.cwd(), lead.snapshotArtifactDirectory, "snapshot.json");

  try {
    const raw = await readFile(snapshotPath, "utf8");
    return SiteSnapshotSchema.parse(JSON.parse(raw)) as SiteSnapshot;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

async function maybeRefreshSnapshot(lead: ClinicLeadSummary) {
  if (!lead.websiteUrl) {
    return undefined;
  }

  const logger = createAntigravityLogger({ app: "clinic-demo-profile-refresh" }).child({
    businessName: lead.businessName,
    leadSlug: lead.slug,
  });
  const result = await createSiteSnapshot({
    websiteUrl: lead.websiteUrl,
    logger,
    maxPages: 6,
    timeoutMs: 10_000,
    rateLimitMs: 1_500,
    captureScreenshots: true,
  });

  return result.status === "success" ? result.snapshot : undefined;
}

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function fieldValue(field?: { value?: unknown }) {
  if (!field || field.value === undefined || field.value === null) {
    return undefined;
  }

  return String(field.value).trim() || undefined;
}

function extractedFactStrings(facts: Array<{ value: unknown }>) {
  return uniqueStrings(
    facts
      .map((fact) => {
        if (typeof fact.value === "string") {
          return fact.value;
        }

        return undefined;
      })
      .filter((value): value is string => Boolean(value)),
  );
}

function structuredFieldStrings(fields: Array<{ value?: unknown }>) {
  return uniqueStrings(
    fields
      .map((field) => {
        if (typeof field.value === "string") {
          return field.value;
        }

        return undefined;
      })
      .filter((value): value is string => Boolean(value)),
  );
}

function buildProspect(lead: ClinicLeadSummary) {
  return DiscoveredProspectSchema.parse({
    prospectId: lead.rowId,
    businessName: lead.businessName,
    websiteDomain: safeDomain(lead.websiteUrl),
    category: lead.category,
    address: lead.address,
    city: "Athens",
    country: "Greece",
    phone: lead.phone,
    visibleEmail: lead.email,
    websiteUrl: lead.websiteUrl,
    mapsUrl: lead.mapsUrl,
    sourceUrl: lead.mapsUrl ?? lead.websiteUrl ?? "https://www.google.com/maps",
    scoring: {
      icpFit: 0.88,
      websitePresent: lead.websiteUrl ? 0.95 : 0.1,
      contactability: lead.email || lead.phone ? 0.85 : 0.55,
      localRelevance: 0.9,
      overall: 0.89,
    },
    confidence: 0.88,
    provenance: [profileSource(lead)],
  });
}

export async function getSavedClinicDemoProfile(leadSlug: string) {
  const profilePath = getClinicDemoProfilePath(leadSlug);

  try {
    const raw = await readFile(profilePath, "utf8");
    const storedProfile = StoredClinicDemoProfileSchema.parse(JSON.parse(raw));
    const currentTemplate = await getTemplateBySlug(storedProfile.template.slug);

    return {
      ...storedProfile,
      template: currentTemplate ?? (storedProfile.template as TemplateCatalogEntry),
    } satisfies ClinicDemoProfile;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

export async function buildClinicDemoProfile(leadSlug: string, options?: { refreshSnapshot?: boolean }) {
  if (!options?.refreshSnapshot) {
    const savedProfile = await getSavedClinicDemoProfile(leadSlug);

    if (savedProfile) {
      return savedProfile;
    }
  }

  const lead = await getClinicLeadSummaryBySlug(leadSlug);
  if (!lead) {
    return undefined;
  }

  const template = await getTemplateBySlug(lead.templateSlug);
  if (!template) {
    throw new Error(`Template "${lead.templateSlug}" was not found in the Virtual Pros catalog.`);
  }

  const snapshot =
    options?.refreshSnapshot && lead.websiteUrl
      ? ((await maybeRefreshSnapshot(lead)) ?? (await loadSnapshotForLead(lead)))
      : await loadSnapshotForLead(lead);
  const prospect = buildProspect(lead);
  const businessData = await extractAthensClinicBusinessData({
    prospect,
    snapshot,
  });
  const extraction = businessData.structuredExtraction;

  const services = extractedFactStrings(businessData.services).slice(0, 8);
  const bookingSignals = extractedFactStrings(businessData.bookingSignals).slice(0, 6);
  const people = uniqueStrings([
    ...structuredFieldStrings(extraction.doctorNames),
    ...structuredFieldStrings(extraction.teamNames),
  ]).slice(0, 6);
  const trustMarkers = uniqueStrings([
    ...structuredFieldStrings(extraction.qualificationsAndSpecialties),
    ...structuredFieldStrings(extraction.trustMarkers),
    ...people,
  ]).slice(0, 8);

  const contactItems = compact([
    lead.phone ? { label: "Phone", value: lead.phone, href: `tel:${lead.phone.replace(/[^\d+]/g, "")}` } : null,
    lead.email ? { label: "Email", value: lead.email, href: `mailto:${lead.email}` } : null,
    lead.address ? { label: "Address", value: lead.address } : null,
    fieldValue(extraction.contactPageUrl) ? { label: "Contact page", value: "Open contact page", href: fieldValue(extraction.contactPageUrl) } : null,
    fieldValue(extraction.bookingUrl) ? { label: "Booking page", value: "Open booking page", href: fieldValue(extraction.bookingUrl) } : null,
  ]);

  return {
    slug: lead.slug,
    businessName: businessData.canonicalName.value as string,
    category: lead.category,
    template,
    summary: businessData.summary,
    heroHeading: `${businessData.canonicalName.value as string} matched to the ${template.title} core demo`,
    heroSubheading:
      template.heroSubheading ??
      `Important public facts from ${businessData.canonicalName.value as string} are layered onto this read-only core template without pulling in the heavier review workflow.`,
    websiteUrl: lead.websiteUrl,
    mapsUrl: lead.mapsUrl,
    address: lead.address,
    rating: lead.rating,
    reviewsCount: lead.reviewsCount,
    snapshotStatus: lead.snapshotStatus,
    contactItems,
    services,
    bookingSignals,
    trustMarkers,
    people,
    unresolvedItems: extraction.unresolvedFields.map((field) => `${field.label}: ${field.englishSummary ?? "unresolved"}`).slice(0, 8),
    liveDemoEligibility: {
      eligible: extraction.liveDemoEligibility.eligible,
      rationale: extraction.liveDemoEligibility.rationale,
      blockers: extraction.liveDemoEligibility.blockers,
    },
    overlayChips: compact([
      lead.category,
      lead.rating ? `${lead.rating.toFixed(1)} rating` : null,
      lead.reviewsCount ? `${Math.round(lead.reviewsCount)} reviews` : null,
      lead.snapshotStatus === "success" ? "snapshot ready" : null,
      template.title,
    ]),
    overlayServices: services.slice(0, 3),
    sourceFacts: businessData.provenance,
  } satisfies ClinicDemoProfile;
}

export function getClinicDemoProfilePath(leadSlug: string) {
  return path.join(PROFILE_OUTPUT_ROOT, `${leadSlug}.json`);
}

export async function saveClinicDemoProfile(profile: ClinicDemoProfile) {
  await mkdir(PROFILE_OUTPUT_ROOT, { recursive: true });
  const outputPath = getClinicDemoProfilePath(profile.slug);
  await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  savedProfileSlugsPromise = null;
  return outputPath;
}

export async function hasLocalClinicLeadDataset() {
  try {
    await access(LEADS_CSV_PATH);
    return true;
  } catch {
    return false;
  }
}
