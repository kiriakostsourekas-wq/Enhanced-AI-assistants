import { z } from "zod";
import {
  ContactValidationSchema,
  KnowledgePackSchema,
  LiveDemoEligibilitySchema,
  StructuredBusinessDataSchema,
} from "@/lib/antigravity/schemas";

export const TemplateBusinessDemoInputSchema = z.object({
  url: z.string().url(),
  businessName: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  mapsUrl: z.string().url().optional(),
});

export const TemplateBusinessDemoChainInputSchema = TemplateBusinessDemoInputSchema.extend({
  output: z.string().trim().min(1).optional(),
  profileSlug: z.string().trim().min(1).optional(),
  maxPages: z.number().int().positive().default(6),
  timeoutMs: z.number().int().positive().default(10_000),
  rateLimitMs: z.number().int().positive().default(1_500),
  captureScreenshots: z.boolean().default(true),
  saveProfile: z.boolean().default(true),
});

const TemplateBusinessDemoCrawlSuccessSchema = z.object({
  status: z.literal("success"),
  domain: z.string().trim().min(1),
  artifactDirectory: z.string().trim().min(1).optional(),
  fetchedPageCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  screenshotStatus: z.string().trim().min(1).optional(),
  finalUrls: z.object({
    homepage: z.string().url().optional(),
    about: z.string().url().optional(),
    services: z.string().url().optional(),
    contact: z.string().url().optional(),
    booking: z.string().url().optional(),
    team: z.string().url().optional(),
    faq: z.string().url().optional(),
  }),
  screenshots: z.object({
    homepage: z.string().trim().min(1).optional(),
    contact: z.string().trim().min(1).optional(),
    booking: z.string().trim().min(1).optional(),
  }),
  visibleSignals: z.object({
    phones: z.array(z.string().trim().min(1)).default([]),
    emails: z.array(z.string().trim().min(1)).default([]),
    addresses: z.array(z.string().trim().min(1)).default([]),
    socialLinks: z.array(z.string().url()).default([]),
    forms: z.array(
      z.object({
        purposeHint: z.string().trim().min(1),
        fieldNames: z.array(z.string().trim().min(1)).default([]),
      }),
    ).default([]),
    imageCount: z.number().int().nonnegative(),
  }),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const TemplateBusinessDemoCrawlBlockedSchema = z.object({
  status: z.literal("blocked"),
  blockedReason: z.string().trim().min(1),
  requestedUrl: z.string().url(),
  robots: z.string().trim().min(1).optional(),
});

const TemplateBusinessDemoUnresolvedFieldSchema = z.object({
  label: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  blockerForLiveDemo: z.boolean(),
});

export const TemplateBusinessDemoExtractionSummarySchema = z.object({
  canonicalName: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  category: z.string().trim().min(1).optional(),
  services: z.array(z.string().trim().min(1)).default([]),
  bookingSignals: z.array(z.string().trim().min(1)).default([]),
  phones: z.array(z.string().trim().min(1)).default([]),
  emails: z.array(z.string().trim().min(1)).default([]),
  address: z.string().trim().min(1).optional(),
  contactPageUrl: z.string().url().optional(),
  bookingUrl: z.string().url().optional(),
  openingHours: z.array(z.string().trim().min(1)).default([]),
  doctorNames: z.array(z.string().trim().min(1)).default([]),
  teamNames: z.array(z.string().trim().min(1)).default([]),
  trustMarkers: z.array(z.string().trim().min(1)).default([]),
  qualificationsAndSpecialties: z.array(z.string().trim().min(1)).default([]),
  testimonials: z.array(z.string().trim().min(1)).default([]),
  socialLinks: z.array(z.string().url()).default([]),
  imageGalleryUrls: z.array(z.string().url()).default([]),
  unresolvedFields: z.array(TemplateBusinessDemoUnresolvedFieldSchema).default([]),
  liveDemoEligibility: LiveDemoEligibilitySchema,
});

export const TemplateBusinessDemoArtifactSchema = z.object({
  generatedAt: z.string().datetime(),
  slug: z.string().trim().min(1),
  input: TemplateBusinessDemoInputSchema,
  templateSlug: z.string().trim().min(1),
  crawl: z.union([TemplateBusinessDemoCrawlSuccessSchema, TemplateBusinessDemoCrawlBlockedSchema]),
  extractionSummary: TemplateBusinessDemoExtractionSummarySchema,
  contactValidation: ContactValidationSchema,
  businessData: StructuredBusinessDataSchema,
  knowledgePack: KnowledgePackSchema,
});

export const TemplateBusinessDemoPreviewSchema = z.object({
  leadSlug: z.string().trim().min(1),
  templateSlug: z.string().trim().min(1),
  clinicDemoUrl: z.string().trim().min(1),
  mirrorUrl: z.string().trim().min(1),
});

export const TemplateBusinessDemoChainResultSchema = z.object({
  artifact: TemplateBusinessDemoArtifactSchema,
  artifactPath: z.string().trim().min(1),
  profilePath: z.string().trim().min(1).optional(),
  preview: TemplateBusinessDemoPreviewSchema.optional(),
});

export type TemplateBusinessDemoInput = z.infer<typeof TemplateBusinessDemoInputSchema>;
export type TemplateBusinessDemoChainInput = z.infer<typeof TemplateBusinessDemoChainInputSchema>;
export type TemplateBusinessDemoArtifact = z.infer<typeof TemplateBusinessDemoArtifactSchema>;
export type TemplateBusinessDemoChainResult = z.infer<typeof TemplateBusinessDemoChainResultSchema>;
