import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { buildAthensClinicKnowledgePack } from "@/lib/antigravity/extraction/knowledge-pack";
import { extractAthensClinicBusinessData } from "@/lib/antigravity/extraction/athens-clinic-extractor";
import { createAntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";
import { DiscoveredProspectSchema } from "@/lib/antigravity/schemas";
import type { ExtractedFact } from "@/lib/antigravity/schemas";
import { createSiteSnapshot } from "@/lib/antigravity/site-snapshot";
import { verifyAthensClinicContactsAndMap } from "@/lib/antigravity/verification/athens-clinic-contact-map-verifier";
import {
  saveClinicDemoProfile,
  type ClinicDemoProfile,
} from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug, matchTemplateSlug } from "@/lib/demo-library/template-catalog";
import {
  TemplateBusinessDemoArtifactSchema,
  TemplateBusinessDemoChainInputSchema,
  TemplateBusinessDemoChainResultSchema,
  type TemplateBusinessDemoArtifact,
  type TemplateBusinessDemoChainInput,
  type TemplateBusinessDemoChainResult,
} from "@/lib/demo-library/template-business-demo-schemas";

export const DEFAULT_TEMPLATE_BUSINESS_DEMO_ARTIFACT_ROOT = path.join(
  process.cwd(),
  "artifacts",
  "template-business-demo-integrator",
);

const NormalizedTemplateBusinessDemoChainInputSchema = TemplateBusinessDemoChainInputSchema.extend({
  businessName: z.string().trim().min(1),
  email: z.string().email().optional(),
  mapsUrl: z.string().url().optional(),
  slug: z.string().trim().min(1),
  outputPath: z.string().trim().min(1),
});

type NormalizedTemplateBusinessDemoChainInput = z.infer<typeof NormalizedTemplateBusinessDemoChainInputSchema>;

const ExtractedTemplateBusinessDemoStateSchema = z.object({
  input: NormalizedTemplateBusinessDemoChainInputSchema,
  artifact: TemplateBusinessDemoArtifactSchema,
});

const PersistedTemplateBusinessDemoStateSchema = ExtractedTemplateBusinessDemoStateSchema.extend({
  artifactPath: z.string().trim().min(1),
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

function safeDomain(value: string) {
  return new URL(value).hostname.toLowerCase().replace(/^www\./i, "");
}

function compact<T>(items: Array<T | null | undefined | false>) {
  return items.filter(Boolean) as T[];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function relativeToRepo(filePath?: string) {
  if (!filePath) {
    return undefined;
  }

  return path.relative(process.cwd(), filePath);
}

function stringValues(values: Array<{ value?: unknown }>) {
  return [...new Set(
    values
      .map((item) => (typeof item.value === "string" ? item.value.trim() : ""))
      .filter(Boolean),
  )];
}

function fieldValue(field?: { status?: string; value?: unknown }) {
  if (!field || field.status === "unresolved" || field.value === undefined || field.value === null) {
    return undefined;
  }

  return typeof field.value === "string" ? field.value.trim() : String(field.value);
}

function factValue(fact?: ExtractedFact) {
  return typeof fact?.value === "string" ? fact.value.trim() : undefined;
}

function bestFactValue(facts: ExtractedFact[]) {
  return [...facts]
    .sort((left, right) => right.confidence - left.confidence)
    .map((fact) => factValue(fact))
    .find(Boolean);
}

function contactHref(label: string, value: string) {
  if (label === "Phone") {
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  }

  if (label === "Email") {
    return `mailto:${value}`;
  }

  return undefined;
}

function defaultArtifactPath(slug: string) {
  return path.join(DEFAULT_TEMPLATE_BUSINESS_DEMO_ARTIFACT_ROOT, `${slug}.json`);
}

function buildProspect(input: NormalizedTemplateBusinessDemoChainInput) {
  const hostname = safeDomain(input.url);

  return DiscoveredProspectSchema.parse({
    prospectId: `manual-url-${input.slug}`,
    businessName: input.businessName,
    websiteDomain: hostname,
    category: input.category?.trim() || undefined,
    address: input.address?.trim() || undefined,
    city: undefined,
    country: undefined,
    phone: input.phone?.trim() || undefined,
    visibleEmail: input.email,
    websiteUrl: input.url,
    mapsUrl: input.mapsUrl,
    sourceUrl: input.mapsUrl ?? input.url,
    scoring: {
      icpFit: 0.8,
      websitePresent: 1,
      contactability: input.phone || input.email ? 0.82 : 0.45,
      localRelevance: 0.7,
      overall: 0.82,
    },
    confidence: 0.85,
    provenance: [
      buildFactSource({
        sourceType: "campaign_seed",
        label: "manual public URL input",
        uri: input.url,
        excerpt: input.businessName,
      }),
    ],
  });
}

export function normalizeTemplateBusinessDemoChainInput(
  input: TemplateBusinessDemoChainInput,
): NormalizedTemplateBusinessDemoChainInput {
  const parsed = TemplateBusinessDemoChainInputSchema.parse(input);
  const url = new URL(parsed.url).toString();
  const hostname = safeDomain(url);
  const businessName = parsed.businessName?.trim() || hostname;
  const slug = parsed.profileSlug?.trim() || slugify(businessName) || slugify(hostname) || "site-extract";

  return NormalizedTemplateBusinessDemoChainInputSchema.parse({
    ...parsed,
    url,
    businessName,
    email: validOptionalEmail(parsed.email),
    mapsUrl: validOptionalUrl(parsed.mapsUrl),
    slug,
    outputPath: path.resolve(process.cwd(), parsed.output ?? defaultArtifactPath(slug)),
  });
}

export async function extractTemplateBusinessDemoArtifact(
  input: NormalizedTemplateBusinessDemoChainInput,
): Promise<TemplateBusinessDemoArtifact> {
  const logger = createAntigravityLogger({
    app: "template-business-demo-integrator",
    url: input.url,
    businessName: input.businessName,
  });
  const prospect = buildProspect(input);
  const snapshotResult = await createSiteSnapshot({
    websiteUrl: input.url,
    logger,
    maxPages: input.maxPages,
    timeoutMs: input.timeoutMs,
    rateLimitMs: input.rateLimitMs,
    captureScreenshots: input.captureScreenshots,
  });

  const snapshot = snapshotResult.status === "success" ? snapshotResult.snapshot : undefined;
  const businessData = await extractAthensClinicBusinessData({
    prospect,
    snapshot,
  });
  const extractedCategory = fieldValue(businessData.structuredExtraction.clinicCategory);
  const templateSlug = matchTemplateSlug(
    [input.category, extractedCategory, businessData.canonicalName.value, input.url]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .join(" "),
  );
  const contactValidation = verifyAthensClinicContactsAndMap({
    prospect,
    businessData,
    snapshot,
    mapsEmbedApiKey: process.env.GOOGLE_MAPS_EMBED_API_KEY,
  });
  const knowledgePack = buildAthensClinicKnowledgePack({
    businessData,
    provenanceUri: input.url,
  });
  const crawl =
    snapshotResult.status === "success"
      ? (() => {
          const successfulSnapshot = snapshotResult.snapshot;

          return {
            status: "success" as const,
            domain: successfulSnapshot.domain,
            artifactDirectory: relativeToRepo(successfulSnapshot.artifactDirectory),
            fetchedPageCount: successfulSnapshot.crawlReport.fetchedPageCount,
            skippedCount: successfulSnapshot.crawlReport.skippedCount,
            screenshotStatus: successfulSnapshot.crawlReport.screenshotStatus,
            finalUrls: {
              homepage: successfulSnapshot.canonicalPages.homepage?.finalUrl,
              about: successfulSnapshot.canonicalPages.about?.finalUrl,
              services: successfulSnapshot.canonicalPages.services?.finalUrl,
              contact: successfulSnapshot.canonicalPages.contact?.finalUrl,
              booking: successfulSnapshot.canonicalPages.booking?.finalUrl,
              team: successfulSnapshot.canonicalPages.team?.finalUrl,
              faq: successfulSnapshot.canonicalPages.faq?.finalUrl,
            },
            screenshots: {
              homepage: relativeToRepo(successfulSnapshot.canonicalPages.homepage?.screenshotPath),
              contact: relativeToRepo(successfulSnapshot.canonicalPages.contact?.screenshotPath),
              booking: relativeToRepo(successfulSnapshot.canonicalPages.booking?.screenshotPath),
            },
            visibleSignals: {
              phones: successfulSnapshot.extractedVisibleElements.phones,
              emails: successfulSnapshot.extractedVisibleElements.emails,
              addresses: successfulSnapshot.extractedVisibleElements.addresses,
              socialLinks: successfulSnapshot.extractedVisibleElements.socialLinks.map((link) => link.href),
              forms: successfulSnapshot.extractedVisibleElements.forms.map((form) => ({
                purposeHint: form.purposeHint,
                fieldNames: form.fieldNames,
              })),
              imageCount: successfulSnapshot.imageReferences.length,
            },
            metadata: successfulSnapshot.metadata,
          };
        })()
      : {
          status: "blocked" as const,
          blockedReason: snapshotResult.blockedReason,
          requestedUrl: snapshotResult.requestedUrl,
          robots: snapshotResult.crawlReport.robots,
        };

  return TemplateBusinessDemoArtifactSchema.parse({
    generatedAt: new Date().toISOString(),
    slug: input.slug,
    input: {
      url: input.url,
      businessName: input.businessName,
      category: input.category?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      email: input.email,
      address: input.address?.trim() || undefined,
      mapsUrl: input.mapsUrl,
    },
    templateSlug,
    crawl,
    extractionSummary: {
      canonicalName: typeof businessData.canonicalName.value === "string" ? businessData.canonicalName.value : input.businessName,
      summary: businessData.summary,
      category: extractedCategory,
      services: stringValues(businessData.services).slice(0, 12),
      bookingSignals: stringValues(businessData.bookingSignals).slice(0, 12),
      phones: stringValues(businessData.structuredExtraction.phoneNumbers).slice(0, 6),
      emails: stringValues(businessData.structuredExtraction.emails).slice(0, 6),
      address: fieldValue(businessData.structuredExtraction.address),
      contactPageUrl: fieldValue(businessData.structuredExtraction.contactPageUrl),
      bookingUrl: fieldValue(businessData.structuredExtraction.bookingUrl),
      openingHours: stringValues(businessData.structuredExtraction.openingHours).slice(0, 10),
      doctorNames: stringValues(businessData.structuredExtraction.doctorNames).slice(0, 10),
      teamNames: stringValues(businessData.structuredExtraction.teamNames).slice(0, 10),
      trustMarkers: stringValues(businessData.structuredExtraction.trustMarkers).slice(0, 12),
      qualificationsAndSpecialties: stringValues(businessData.structuredExtraction.qualificationsAndSpecialties).slice(0, 12),
      testimonials: stringValues(businessData.structuredExtraction.testimonials).slice(0, 8),
      socialLinks: stringValues(businessData.structuredExtraction.socialLinks).slice(0, 10),
      imageGalleryUrls: stringValues(businessData.structuredExtraction.imageGalleryUrls).slice(0, 12),
      unresolvedFields: businessData.structuredExtraction.unresolvedFields.map((field) => ({
        label: field.label,
        reason: field.englishSummary ?? "unresolved",
        blockerForLiveDemo: field.blockerForLiveDemo,
      })),
      liveDemoEligibility: businessData.structuredExtraction.liveDemoEligibility,
    },
    contactValidation,
    businessData,
    knowledgePack,
  });
}

export async function writeTemplateBusinessDemoArtifact(artifact: TemplateBusinessDemoArtifact, outputPath: string) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  return outputPath;
}

export async function buildClinicDemoProfileFromTemplateBusinessArtifact(
  artifact: TemplateBusinessDemoArtifact,
): Promise<ClinicDemoProfile> {
  const template = await getTemplateBySlug(artifact.templateSlug);

  if (!template) {
    throw new Error(`Template "${artifact.templateSlug}" was not found in the Virtual Pros catalog.`);
  }

  const extraction = artifact.businessData.structuredExtraction;
  const canonicalName = artifact.extractionSummary.canonicalName;
  const category = artifact.extractionSummary.category ?? artifact.input.category;
  const services = stringValues(artifact.businessData.services).slice(0, 8);
  const bookingSignals = stringValues(artifact.businessData.bookingSignals).slice(0, 6);
  const people = uniqueStrings([
    ...stringValues(extraction.doctorNames),
    ...stringValues(extraction.teamNames),
  ]).slice(0, 6);
  const trustMarkers = uniqueStrings([
    ...stringValues(extraction.qualificationsAndSpecialties),
    ...stringValues(extraction.trustMarkers),
    ...people,
  ]).slice(0, 8);
  const phone = bestFactValue(artifact.contactValidation.validatedPhones) ?? artifact.input.phone ?? artifact.extractionSummary.phones[0];
  const email = bestFactValue(artifact.contactValidation.validatedEmails) ?? artifact.input.email ?? artifact.extractionSummary.emails[0];
  const address = factValue(artifact.contactValidation.validatedAddress) ?? artifact.input.address ?? artifact.extractionSummary.address;
  const mapsUrl =
    factValue(artifact.contactValidation.validatedMapsListing) ??
    artifact.contactValidation.mapEmbedConfiguration.linkUrl ??
    artifact.input.mapsUrl;
  const contactPageUrl = factValue(artifact.contactValidation.validatedContactPage) ?? artifact.extractionSummary.contactPageUrl;
  const bookingUrl = factValue(artifact.contactValidation.validatedBookingPage) ?? artifact.extractionSummary.bookingUrl;
  const liveDemoBlockers = uniqueStrings([
    ...artifact.extractionSummary.liveDemoEligibility.blockers,
    ...artifact.contactValidation.blockers,
  ]);

  const contactItems = compact([
    phone ? { label: "Phone", value: phone, href: contactHref("Phone", phone) } : null,
    email ? { label: "Email", value: email, href: contactHref("Email", email) } : null,
    address ? { label: "Address", value: address } : null,
    mapsUrl ? { label: "Map", value: "Open location", href: mapsUrl } : null,
    contactPageUrl ? { label: "Contact page", value: "Open contact page", href: contactPageUrl } : null,
    bookingUrl ? { label: "Booking page", value: "Open booking page", href: bookingUrl } : null,
  ]);

  return {
    slug: artifact.slug,
    businessName: canonicalName,
    category,
    template,
    summary: artifact.businessData.summary,
    heroHeading: `${canonicalName} matched to the ${template.title} core demo`,
    heroSubheading:
      template.heroSubheading ??
      `Important public facts from ${canonicalName} are layered onto this read-only core template without pulling in the heavier review workflow.`,
    websiteUrl: artifact.input.url,
    mapsUrl,
    address,
    snapshotStatus: artifact.crawl.status,
    contactItems,
    services,
    bookingSignals,
    trustMarkers,
    people,
    unresolvedItems: [
      ...artifact.extractionSummary.unresolvedFields.map((field) => `${field.label}: ${field.reason}`),
      ...artifact.contactValidation.warnings.map((warning) => `Validation: ${warning}`),
    ].slice(0, 8),
    liveDemoEligibility: {
      eligible: artifact.extractionSummary.liveDemoEligibility.eligible && artifact.contactValidation.liveDemoEligibility,
      rationale: artifact.contactValidation.operatorSummary,
      blockers: liveDemoBlockers,
    },
    overlayChips: compact([
      category,
      artifact.contactValidation.pass ? "contacts verified" : null,
      artifact.contactValidation.liveDemoEligibility ? "live demo ready" : null,
      artifact.crawl.status === "success" ? "snapshot ready" : null,
      template.title,
    ]),
    overlayServices: services.slice(0, 3),
    sourceFacts: artifact.businessData.provenance,
  } satisfies ClinicDemoProfile;
}

export function createTemplateBusinessDemoChain() {
  const normalizeRunnable = new RunnableLambda<TemplateBusinessDemoChainInput, NormalizedTemplateBusinessDemoChainInput>({
    func: async (input: TemplateBusinessDemoChainInput) => normalizeTemplateBusinessDemoChainInput(input),
  });

  const extractRunnable = new RunnableLambda<
    NormalizedTemplateBusinessDemoChainInput,
    z.infer<typeof ExtractedTemplateBusinessDemoStateSchema>
  >({
    func: async (input: NormalizedTemplateBusinessDemoChainInput) =>
      ExtractedTemplateBusinessDemoStateSchema.parse({
        input,
        artifact: await extractTemplateBusinessDemoArtifact(input),
      }),
  });

  const persistArtifactRunnable = new RunnableLambda<
    z.infer<typeof ExtractedTemplateBusinessDemoStateSchema>,
    z.infer<typeof PersistedTemplateBusinessDemoStateSchema>
  >({
    func: async (state: z.infer<typeof ExtractedTemplateBusinessDemoStateSchema>) =>
      PersistedTemplateBusinessDemoStateSchema.parse({
        ...state,
        artifactPath: await writeTemplateBusinessDemoArtifact(state.artifact, state.input.outputPath),
      }),
  });

  const finalizeRunnable = new RunnableLambda<
    z.infer<typeof PersistedTemplateBusinessDemoStateSchema>,
    TemplateBusinessDemoChainResult
  >({
    func: async (state: z.infer<typeof PersistedTemplateBusinessDemoStateSchema>) => {
      if (!state.input.saveProfile) {
        return TemplateBusinessDemoChainResultSchema.parse({
          artifact: state.artifact,
          artifactPath: state.artifactPath,
        });
      }

      const profile = await buildClinicDemoProfileFromTemplateBusinessArtifact(state.artifact);
      const profilePath = await saveClinicDemoProfile(profile);

      return TemplateBusinessDemoChainResultSchema.parse({
        artifact: state.artifact,
        artifactPath: state.artifactPath,
        profilePath,
        preview: {
          leadSlug: profile.slug,
          templateSlug: profile.template.slug,
          clinicDemoUrl: `/clinic-demos/${encodeURIComponent(profile.slug)}`,
          mirrorUrl: `${profile.template.mirrorHref}?lead=${encodeURIComponent(profile.slug)}`,
        },
      });
    },
  });

  return RunnableSequence.from([
    normalizeRunnable,
    extractRunnable,
    persistArtifactRunnable,
    finalizeRunnable,
  ]);
}

export async function runTemplateBusinessDemoChain(
  input: TemplateBusinessDemoChainInput,
): Promise<TemplateBusinessDemoChainResult> {
  return createTemplateBusinessDemoChain().invoke(input);
}
