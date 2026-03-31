import { z } from "zod";

export const CampaignOutreachModeSchema = z.enum(["draft_only", "auto_send"]);
export const DiscoveryProviderSchema = z.enum(["static_seed", "appointment_smb_csv", "custom"]);
export const PipelineStageNameSchema = z.enum([
  "discover_prospects",
  "crawl_website",
  "grade_website",
  "extract_business_data",
  "build_knowledge_pack",
  "generate_demo_chatbot_config",
  "generate_demo_landing_page",
  "validate_contacts_and_maps",
  "deploy_preview_url",
  "draft_outreach_email",
]);

export const CampaignRunStatusSchema = z.enum([
  "pending",
  "running",
  "awaiting_review",
  "completed",
  "failed",
]);

export const ProspectRunStatusSchema = z.enum([
  "queued",
  "running",
  "blocked",
  "awaiting_review",
  "completed",
  "failed",
]);

export const StageAttemptStatusSchema = z.enum(["running", "succeeded", "blocked", "failed"]);

export const ConfidenceScoreSchema = z.number().min(0).max(1);
export const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonValueSchema), z.record(z.string(), JsonValueSchema)]),
);

export const FactSourceSchema = z.object({
  sourceType: z.enum([
    "campaign_seed",
    "discovery_provider",
    "website_crawl",
    "contact_validation",
    "maps_validation",
    "manual_review",
    "stage_output",
  ]),
  uri: z.string().min(1),
  label: z.string().min(1),
  retrievedAt: z.string().datetime(),
  excerpt: z.string().min(1).optional(),
});

export const ExtractedFactSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: JsonValueSchema,
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const GeographySchema = z.object({
  countryCode: z.string().trim().length(2).toUpperCase(),
  region: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  radiusKm: z.number().int().positive().max(250).default(25),
});

export const SeedProspectSchema = z.object({
  businessName: z.string().trim().min(1),
  category: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  websiteUrl: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  notes: z.string().trim().min(1).optional(),
});

export const LeadScoreSchema = z.object({
  icpFit: ConfidenceScoreSchema,
  websitePresent: ConfidenceScoreSchema,
  contactability: ConfidenceScoreSchema,
  localRelevance: ConfidenceScoreSchema,
  overall: ConfidenceScoreSchema,
});

export const CampaignConfigSchema = z
  .object({
    campaignId: z
      .string()
      .trim()
      .min(3)
      .regex(/^[a-z0-9-]+$/),
    displayName: z.string().trim().min(3),
    vertical: z.string().trim().min(2),
    geography: GeographySchema,
    targetLeadCount: z.number().int().positive().max(500),
    maxDemoCount: z.number().int().positive().max(100),
    outreachMode: CampaignOutreachModeSchema.default("draft_only"),
    discovery: z
      .object({
        provider: DiscoveryProviderSchema.default("static_seed"),
        seedQueries: z.array(z.string().trim().min(1)).default([]),
        seedProspects: z.array(SeedProspectSchema).default([]),
        csvDatasetPath: z.string().trim().min(1).optional(),
        minimumOverallScore: ConfidenceScoreSchema.default(0.55),
        excludeDomains: z.array(z.string().trim().min(1)).default([]),
        excludeBusinessNames: z.array(z.string().trim().min(1)).default([]),
      })
      .default({
        provider: "static_seed",
        seedQueries: [],
        seedProspects: [],
        minimumOverallScore: 0.55,
        excludeDomains: [],
        excludeBusinessNames: [],
      }),
    deployment: z
      .object({
        previewBaseUrl: z.string().trim().min(1).optional(),
        previewRoutePrefix: z.string().trim().min(1).default("/antigravity-previews"),
      })
      .default({ previewRoutePrefix: "/antigravity-previews" }),
    schedule: z
      .object({
        cron: z.string().trim().min(1).default("0 6 * * *"),
        timezone: z.string().trim().min(1).default("UTC"),
      })
      .default({ cron: "0 6 * * *", timezone: "UTC" }),
    metadata: z.record(z.string(), z.string()).default({}),
  })
  .superRefine((value, ctx) => {
    if (value.maxDemoCount > value.targetLeadCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "maxDemoCount cannot exceed targetLeadCount.",
        path: ["maxDemoCount"],
      });
    }

    if (value.discovery.provider === "static_seed" && value.discovery.seedProspects.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Static seed discovery requires at least one seedProspect.",
        path: ["discovery", "seedProspects"],
      });
    }
  });

export const DiscoveredProspectSchema = z.object({
  prospectId: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  websiteDomain: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  visibleEmail: z.string().email().optional(),
  contactPageUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  scoring: LeadScoreSchema,
  notes: z.string().trim().min(1).optional(),
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const DiscoveryBatchSchema = z.object({
  prospects: z.array(DiscoveredProspectSchema),
  requestedLeadCount: z.number().int().positive(),
  returnedLeadCount: z.number().int().nonnegative(),
  providerName: z.string().trim().min(1),
});

export const WebsiteLinkSchema = z.object({
  href: z.string().url(),
  label: z.string().trim().min(1).optional(),
});

export const SitePageTypeSchema = z.enum([
  "homepage",
  "about",
  "services",
  "contact",
  "booking",
  "team",
  "faq",
  "generic",
]);

export const SiteMetadataSchema = z.object({
  title: z.string().trim().min(1).optional(),
  metaDescription: z.string().trim().min(1).optional(),
  canonicalUrl: z.string().url().optional(),
  language: z.string().trim().min(1).optional(),
  robots: z.string().trim().min(1).optional(),
  openGraphTitle: z.string().trim().min(1).optional(),
  openGraphDescription: z.string().trim().min(1).optional(),
  openGraphImage: z.string().url().optional(),
});

export const SiteHeadingSchema = z.object({
  level: z.enum(["h1", "h2", "h3"]),
  text: z.string().trim().min(1),
});

export const SiteFormFieldSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  required: z.boolean().default(false),
});

export const SiteFormSchema = z.object({
  action: z.string().trim().min(1).optional(),
  method: z.string().trim().min(1).optional(),
  purposeHint: z.enum(["contact", "booking", "newsletter", "generic"]),
  fieldNames: z.array(z.string().trim().min(1)).default([]),
  submitLabels: z.array(z.string().trim().min(1)).default([]),
  fields: z.array(SiteFormFieldSchema).default([]),
});

export const SiteVisibleElementsSchema = z.object({
  phones: z.array(z.string().trim().min(1)).default([]),
  emails: z.array(z.string().trim().min(1)).default([]),
  addresses: z.array(z.string().trim().min(1)).default([]),
  socialLinks: z.array(WebsiteLinkSchema).default([]),
  forms: z.array(SiteFormSchema).default([]),
});

export const SiteImageReferenceSchema = z.object({
  url: z.string().url(),
  alt: z.string().trim().min(1).optional(),
  sourcePageUrl: z.string().url(),
  pageType: SitePageTypeSchema,
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const SiteContactCandidateSchema = z.object({
  type: z.enum(["phone", "email", "address", "contact_page", "booking_page", "form", "maps"]),
  value: z.string().trim().min(1),
  sourcePageUrl: z.string().url(),
  pageType: SitePageTypeSchema,
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const CrawlDecisionSchema = z.object({
  url: z.string().trim().min(1),
  action: z.enum([
    "queued",
    "fetched",
    "skipped",
    "blocked_by_robots",
    "blocked_by_policy",
    "error",
    "screenshot_captured",
    "screenshot_skipped",
  ]),
  reason: z.string().trim().min(1).optional(),
  pageTypeHint: SitePageTypeSchema.optional(),
  statusCode: z.number().int().positive().optional(),
  timestamp: z.string().datetime(),
});

export const RobotsPolicySchema = z.object({
  robotsUrl: z.string().url(),
  fetchedAt: z.string().datetime(),
  status: z.enum(["present", "missing", "blocked", "error"]),
  matchedUserAgent: z.string().trim().min(1).optional(),
  crawlDelayMs: z.number().int().nonnegative().optional(),
  allowRules: z.array(z.string().trim().min(1)).default([]),
  disallowRules: z.array(z.string().trim().min(1)).default([]),
  provenance: z.array(FactSourceSchema).min(1),
});

export const SitePageSnapshotSchema = z.object({
  pageType: SitePageTypeSchema,
  requestedUrl: z.string().url(),
  finalUrl: z.string().url(),
  fetchedAt: z.string().datetime(),
  statusCode: z.number().int().positive().optional(),
  metadata: SiteMetadataSchema,
  headings: z.array(SiteHeadingSchema).default([]),
  internalLinks: z.array(WebsiteLinkSchema).default([]),
  forms: z.array(SiteFormSchema).default([]),
  visibleElements: SiteVisibleElementsSchema,
  footerText: z.string().trim().min(1).optional(),
  textContent: z.string().trim().min(1).optional(),
  rawHtmlPath: z.string().trim().min(1),
  cleanedTextPath: z.string().trim().min(1),
  screenshotPath: z.string().trim().min(1).optional(),
  imageReferences: z.array(SiteImageReferenceSchema).default([]),
  classificationConfidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const CanonicalSitePagesSchema = z.object({
  homepage: SitePageSnapshotSchema.optional(),
  about: SitePageSnapshotSchema.optional(),
  services: SitePageSnapshotSchema.optional(),
  contact: SitePageSnapshotSchema.optional(),
  booking: SitePageSnapshotSchema.optional(),
  team: SitePageSnapshotSchema.optional(),
  faq: SitePageSnapshotSchema.optional(),
});

export const SiteCrawlReportSchema = z.object({
  requestedUrl: z.string().url(),
  finalOrigin: z.string().url().optional(),
  maxPages: z.number().int().positive(),
  fetchTimeoutMs: z.number().int().positive(),
  rateLimitMs: z.number().int().positive(),
  robots: RobotsPolicySchema.optional(),
  fetchedPageCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  screenshotStatus: z.enum(["captured", "skipped", "not_requested"]),
  screenshotReason: z.string().trim().min(1).optional(),
  decisions: z.array(CrawlDecisionSchema).default([]),
  skippedUrls: z.array(CrawlDecisionSchema).default([]),
});

export const SiteSnapshotSchema = z.object({
  domain: z.string().trim().min(1),
  collectedAt: z.string().datetime(),
  artifactDirectory: z.string().trim().min(1),
  canonicalPages: CanonicalSitePagesSchema,
  extractedVisibleElements: SiteVisibleElementsSchema,
  metadata: SiteMetadataSchema,
  imageReferences: z.array(SiteImageReferenceSchema).default([]),
  contactCandidates: z.array(SiteContactCandidateSchema).default([]),
  crawlReport: SiteCrawlReportSchema,
});

export const WebsiteCrawlResultSchema = z.object({
  status: z.enum(["success", "not_available", "blocked"]),
  finalUrl: z.string().url().optional(),
  fetchedAt: z.string().datetime(),
  statusCode: z.number().int().positive().optional(),
  title: z.string().trim().min(1).optional(),
  metaDescription: z.string().trim().min(1).optional(),
  textContent: z.string().trim().min(1).optional(),
  htmlSha256: z.string().trim().min(1).optional(),
  discoveredLinks: z.array(WebsiteLinkSchema).default([]),
  siteSnapshot: SiteSnapshotSchema.optional(),
  blockedReason: z.string().trim().min(1).optional(),
  provenance: z.array(FactSourceSchema).min(1),
});

export const WebsiteGradeInsightSchema = z.object({
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  whyThisMattersCommercially: z.string().trim().min(1),
});

export const WebsiteGradeCategoryScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  rationale: z.string().trim().min(1),
  whyThisMattersCommercially: z.string().trim().min(1),
});

export const WebsiteGradeCategoryScoresSchema = z.object({
  offerClarity: WebsiteGradeCategoryScoreSchema,
  trustAndMedicalCredibility: WebsiteGradeCategoryScoreSchema,
  conversionReadiness: WebsiteGradeCategoryScoreSchema,
  mobileUxHeuristics: WebsiteGradeCategoryScoreSchema,
  bookingContactFriction: WebsiteGradeCategoryScoreSchema,
  localProofForAthens: WebsiteGradeCategoryScoreSchema,
  greekFirstUsability: WebsiteGradeCategoryScoreSchema,
  seoBasics: WebsiteGradeCategoryScoreSchema,
  overallDemoWorthiness: WebsiteGradeCategoryScoreSchema,
});

export const WebsiteGradeSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  gradeBand: z.enum(["excellent", "healthy", "weak", "missing"]),
  conversionReadinessScore: z.number().int().min(0).max(100),
  bookingReadinessScore: z.number().int().min(0).max(100),
  demoOpportunityScore: z.number().int().min(0).max(100),
  demoOpportunityGate: z.boolean(),
  categoryScores: WebsiteGradeCategoryScoresSchema,
  plainEnglishDiagnosis: z.string().trim().min(1),
  operatorSummary: z.string().trim().min(1),
  topWeaknesses: z.array(WebsiteGradeInsightSchema).min(1).max(5),
  topDemoImprovementOpportunities: z.array(WebsiteGradeInsightSchema).min(1).max(3),
  issues: z.array(z.string().trim().min(1)),
  strengths: z.array(z.string().trim().min(1)),
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const LanguageCodeSchema = z.enum(["el", "en", "mixed", "unknown"]);

export const LanguageAssessmentSchema = z.object({
  language: LanguageCodeSchema,
  confidence: ConfidenceScoreSchema,
  rationale: z.string().trim().min(1),
});

export const PageLanguageAssessmentSchema = z.object({
  url: z.string().url(),
  pageType: SitePageTypeSchema,
  assessment: LanguageAssessmentSchema,
});

export const StructuredFieldStatusSchema = z.enum(["verified_fact", "inferred_suggestion", "unresolved"]);

export const StructuredClinicFieldSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  status: StructuredFieldStatusSchema,
  value: JsonValueSchema.optional(),
  originalText: z.string().trim().min(1).optional(),
  englishSummary: z.string().trim().min(1).optional(),
  sourceLanguage: LanguageCodeSchema.default("unknown"),
  confidence: ConfidenceScoreSchema,
  blockerForLiveDemo: z.boolean().default(false),
  provenance: z.array(FactSourceSchema).min(1),
});

export const ClinicExtractionLanguageProfileSchema = z.object({
  overall: LanguageAssessmentSchema,
  pages: z.array(PageLanguageAssessmentSchema).default([]),
  sections: z.record(z.string(), LanguageAssessmentSchema).default({}),
});

export const LiveDemoEligibilitySchema = z.object({
  eligible: z.boolean(),
  confidence: ConfidenceScoreSchema,
  blockers: z.array(z.string().trim().min(1)).default([]),
  rationale: z.string().trim().min(1),
});

export const ClinicStructuredExtractionSchema = z.object({
  clinicName: StructuredClinicFieldSchema,
  clinicCategory: StructuredClinicFieldSchema,
  coreServices: z.array(StructuredClinicFieldSchema).default([]),
  address: StructuredClinicFieldSchema,
  neighborhood: StructuredClinicFieldSchema,
  phoneNumbers: z.array(StructuredClinicFieldSchema).default([]),
  emails: z.array(StructuredClinicFieldSchema).default([]),
  contactPageUrl: StructuredClinicFieldSchema,
  bookingUrl: StructuredClinicFieldSchema,
  openingHours: z.array(StructuredClinicFieldSchema).default([]),
  doctorNames: z.array(StructuredClinicFieldSchema).default([]),
  teamNames: z.array(StructuredClinicFieldSchema).default([]),
  yearsOfExperience: StructuredClinicFieldSchema,
  qualificationsAndSpecialties: z.array(StructuredClinicFieldSchema).default([]),
  clinicStory: StructuredClinicFieldSchema,
  testimonials: z.array(StructuredClinicFieldSchema).default([]),
  faqs: z.array(StructuredClinicFieldSchema).default([]),
  trustMarkers: z.array(StructuredClinicFieldSchema).default([]),
  socialLinks: z.array(StructuredClinicFieldSchema).default([]),
  imageGalleryUrls: z.array(StructuredClinicFieldSchema).default([]),
  logoUrl: StructuredClinicFieldSchema,
  brandColors: z.array(StructuredClinicFieldSchema).default([]),
  pageLanguageProfile: ClinicExtractionLanguageProfileSchema,
  operatorEnglishSummary: z.string().trim().min(1).optional(),
  unresolvedFields: z.array(StructuredClinicFieldSchema).default([]),
  liveDemoEligibility: LiveDemoEligibilitySchema,
});

export const StructuredBusinessDataSchema = z.object({
  canonicalName: ExtractedFactSchema,
  summary: z.string().trim().min(1),
  services: z.array(ExtractedFactSchema),
  bookingSignals: z.array(ExtractedFactSchema),
  contactFacts: z.array(ExtractedFactSchema),
  locationFacts: z.array(ExtractedFactSchema),
  hoursFacts: z.array(ExtractedFactSchema),
  disclaimerFacts: z.array(ExtractedFactSchema),
  structuredExtraction: ClinicStructuredExtractionSchema,
  extractionConfidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const KnowledgePackSectionSchema = z.object({
  heading: z.string().trim().min(1),
  body: z.string().trim().min(1),
  supportingFacts: z.array(ExtractedFactSchema).min(1),
});

export const KnowledgePackSchema = z.object({
  title: z.string().trim().min(1),
  generatedAt: z.string().datetime(),
  summary: z.string().trim().min(1),
  sections: z.array(KnowledgePackSectionSchema).min(1),
  markdown: z.string().trim().min(1),
  structuredJson: ClinicStructuredExtractionSchema,
  unresolvedFieldsReport: z.array(StructuredClinicFieldSchema).default([]),
  liveDemoEligibility: LiveDemoEligibilitySchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const DemoChatbotConfigSchema = z.object({
  assistantName: z.string().trim().min(1),
  systemPrompt: z.string().trim().min(1),
  leadCaptureFields: z.array(z.string().trim().min(1)).min(1),
  escalationRules: z.array(z.string().trim().min(1)).min(1),
  prohibitedClaims: z.array(z.string().trim().min(1)),
  provenance: z.array(FactSourceSchema).min(1),
});

export const DemoLandingPageRenderModeSchema = z.enum(["live_demo", "concept_demo"]);

export const DemoLandingPageSectionSchema = z.object({
  heading: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

export const DemoLandingPageCtaSchema = z.object({
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
});

export const DemoLandingPageHeroStatSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const DemoLandingPageHeroSchema = z.object({
  eyebrow: z.string().trim().min(1),
  headline: z.string().trim().min(1),
  subheadline: z.string().trim().min(1),
  primaryCta: DemoLandingPageCtaSchema,
  secondaryCta: DemoLandingPageCtaSchema.optional(),
  badges: z.array(z.string().trim().min(1)).default([]),
  stats: z.array(DemoLandingPageHeroStatSchema).default([]),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().trim().min(1).optional(),
});

export const DemoLandingPageInsightSchema = z.object({
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
});

export const DemoLandingPageServiceSchema = z.object({
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1).optional(),
});

export const DemoLandingPageDoctorSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1).optional(),
});

export const DemoLandingPageTestimonialSchema = z.object({
  quote: z.string().trim().min(1),
  source: z.string().trim().min(1).optional(),
});

export const DemoLandingPageFaqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1).optional(),
});

export const DemoLandingPageContactItemSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  href: z.string().trim().min(1).optional(),
});

export const DemoLandingPageMapSchema = z.object({
  title: z.string().trim().min(1),
  embedUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  helperText: z.string().trim().min(1).optional(),
});

export const DemoLandingPageChatbotSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  endpointPath: z.string().trim().min(1),
  initialAssistantMessage: z.string().trim().min(1),
  starterPrompts: z.array(z.string().trim().min(1)).default([]),
  cta: DemoLandingPageCtaSchema,
  leadCaptureFields: z.array(z.string().trim().min(1)).min(1),
  disabledReason: z.string().trim().min(1).optional(),
});

export const DemoLandingPageFooterSchema = z.object({
  note: z.string().trim().min(1),
  contactItems: z.array(DemoLandingPageContactItemSchema).default([]),
  locationNote: z.string().trim().min(1).optional(),
});

export const DemoLandingPageSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  metaDescription: z.string().trim().min(1).optional(),
  renderingMode: DemoLandingPageRenderModeSchema,
  modeNotice: z.string().trim().min(1).optional(),
  headline: z.string().trim().min(1),
  subheadline: z.string().trim().min(1),
  callToActionLabel: z.string().trim().min(1),
  hero: DemoLandingPageHeroSchema,
  improvementHighlights: z.array(DemoLandingPageInsightSchema).default([]),
  services: z.array(DemoLandingPageServiceSchema).default([]),
  trustItems: z.array(z.string().trim().min(1)).default([]),
  doctorCards: z.array(DemoLandingPageDoctorSchema).default([]),
  testimonials: z.array(DemoLandingPageTestimonialSchema).default([]),
  faqs: z.array(DemoLandingPageFaqSchema).default([]),
  contactItems: z.array(DemoLandingPageContactItemSchema).default([]),
  map: DemoLandingPageMapSchema.optional(),
  chatbot: DemoLandingPageChatbotSchema,
  persistentCta: DemoLandingPageCtaSchema,
  footer: DemoLandingPageFooterSchema,
  sections: z.array(DemoLandingPageSectionSchema).min(1),
  provenance: z.array(FactSourceSchema).min(1),
});

export const ContactValidationCheckNameSchema = z.enum([
  "address_consistency",
  "neighborhood_consistency",
  "phone_format_visibility",
  "email_format",
  "contact_page_existence",
  "cta_path_validity",
  "map_embed_configuration",
]);

export const ContactValidationCheckStatusSchema = z.enum(["passed", "warning", "failed"]);

export const ContactValidationCheckSchema = z.object({
  name: ContactValidationCheckNameSchema,
  status: ContactValidationCheckStatusSchema,
  confidence: ConfidenceScoreSchema,
  summary: z.string().trim().min(1),
});

export const MapEmbedConfigurationSchema = z.object({
  provider: z.literal("google_maps"),
  mode: z.enum(["place_id", "address", "public_link_only", "none"]),
  safeForLiveWidget: z.boolean(),
  confidence: ConfidenceScoreSchema,
  summary: z.string().trim().min(1),
  usesEmbedApi: z.boolean(),
  embedUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  placeId: z.string().trim().min(1).optional(),
  addressQuery: z.string().trim().min(1).optional(),
});

export const ContactValidationSchema = z.object({
  pass: z.boolean(),
  liveDemoEligibility: z.boolean(),
  blockers: z.array(z.string().trim().min(1)).default([]),
  warnings: z.array(z.string().trim().min(1)).default([]),
  recommendedRenderMode: DemoLandingPageRenderModeSchema,
  validatedAddress: ExtractedFactSchema.optional(),
  validatedNeighborhood: ExtractedFactSchema.optional(),
  validatedEmails: z.array(ExtractedFactSchema).default([]),
  validatedPhones: z.array(ExtractedFactSchema).default([]),
  validatedContactPage: ExtractedFactSchema.optional(),
  validatedBookingPage: ExtractedFactSchema.optional(),
  validatedMapsListing: ExtractedFactSchema.optional(),
  mapEmbedConfiguration: MapEmbedConfigurationSchema,
  overallConfidence: ConfidenceScoreSchema,
  checks: z.array(ContactValidationCheckSchema).default([]),
  operatorSummary: z.string().trim().min(1),
  provenance: z.array(FactSourceSchema).min(1),
});

export const PreviewDeploymentSchema = z.object({
  status: z.enum(["deployed", "skipped"]),
  previewUrl: z.string().trim().min(1).optional(),
  artifactDirectory: z.string().trim().min(1),
  deployedAt: z.string().datetime(),
  provenance: z.array(FactSourceSchema).min(1),
});

export const OutreachVariantStyleSchema = z.enum(["concise_founder", "warmer_consultative"]);

export const OutreachEnglishTranslationSchema = z.object({
  subjectLinesEnglish: z.array(z.string().trim().min(1)).length(3),
  primaryEmailEnglish: z.string().trim().min(1),
  alternateEmailEnglish: z.string().trim().min(1).optional(),
  followUpEmailEnglish: z.string().trim().min(1),
  dmEnglish: z.string().trim().min(1),
});

export const ReviewDecisionStatusSchema = z.enum([
  "pending_review",
  "approved_for_outreach",
  "rejected",
  "do_not_contact",
]);

export const ReviewFactOverrideValueModeSchema = z.enum(["scalar", "list"]);

export const ReviewAuditActionSchema = z.enum([
  "approve_for_outreach",
  "reject",
  "edit_fact",
  "regenerate_demo",
  "regenerate_outreach",
  "mark_do_not_contact",
]);

export const ReviewFactOverrideSchema = z.object({
  overrideId: z.string().trim().min(1),
  fieldKey: z.string().trim().min(1),
  label: z.string().trim().min(1),
  valueMode: ReviewFactOverrideValueModeSchema,
  valueText: z.string().trim().min(1),
  note: z.string().trim().min(1).optional(),
  updatedBy: z.string().trim().min(1),
  updatedAt: z.string().datetime(),
});

export const ReviewAuditEventSchema = z.object({
  eventId: z.string().trim().min(1),
  action: ReviewAuditActionSchema,
  actor: z.string().trim().min(1),
  note: z.string().trim().min(1).optional(),
  details: JsonValueSchema.optional(),
  createdAt: z.string().datetime(),
});

export const ReviewRecordSchema = z.object({
  campaignSlug: z.string().trim().min(1),
  prospectSlug: z.string().trim().min(1),
  decisionStatus: ReviewDecisionStatusSchema,
  decisionNote: z.string().trim().min(1).optional(),
  factOverrides: z.array(ReviewFactOverrideSchema).default([]),
  auditTrail: z.array(ReviewAuditEventSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const OutreachDraftSchema = z.object({
  status: z.enum(["drafted", "awaiting_review", "sent"]),
  subject: z.string().trim().min(1),
  bodyText: z.string().trim().min(1),
  language: z.literal("el"),
  primaryVariantStyle: OutreachVariantStyleSchema,
  alternateVariantStyle: OutreachVariantStyleSchema.optional(),
  subjectLinesGreek: z.array(z.string().trim().min(1)).length(3),
  observationsGreek: z.array(z.string().trim().min(1)).min(2).max(3),
  primaryEmailGreek: z.string().trim().min(1),
  alternateEmailGreek: z.string().trim().min(1).optional(),
  followUpEmailGreek: z.string().trim().min(1),
  dmGreek: z.string().trim().min(1),
  englishInternalTranslation: OutreachEnglishTranslationSchema.optional(),
  reviewRequired: z.boolean(),
  autoSendAllowed: z.boolean(),
  provenance: z.array(FactSourceSchema).min(1),
});

export const CampaignRunRecordSchema = z.object({
  runId: z.string().uuid(),
  campaignId: z.string().trim().min(1),
  idempotencyKey: z.string().trim().min(1),
  status: CampaignRunStatusSchema,
  currentStage: PipelineStageNameSchema.optional(),
  scheduledFor: z.string().datetime(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  config: CampaignConfigSchema,
  summary: z.record(z.string(), JsonValueSchema).default({}),
});

export const ProspectRunStateSchema = z.object({
  runId: z.string().uuid(),
  campaignId: z.string().trim().min(1),
  prospect: DiscoveredProspectSchema,
  status: ProspectRunStatusSchema,
  currentStage: PipelineStageNameSchema.optional(),
  crawl: WebsiteCrawlResultSchema.optional(),
  websiteGrade: WebsiteGradeSchema.optional(),
  businessData: StructuredBusinessDataSchema.optional(),
  knowledgePack: KnowledgePackSchema.optional(),
  chatbotConfig: DemoChatbotConfigSchema.optional(),
  landingPage: DemoLandingPageSchema.optional(),
  contactValidation: ContactValidationSchema.optional(),
  previewDeployment: PreviewDeploymentSchema.optional(),
  outreachDraft: OutreachDraftSchema.optional(),
  blockingReason: z.string().trim().min(1).optional(),
});

export const StageAttemptRecordSchema = z.object({
  attemptId: z.string().uuid(),
  runId: z.string().uuid(),
  prospectId: z.string().trim().min(1).optional(),
  stage: PipelineStageNameSchema,
  status: StageAttemptStatusSchema,
  attemptNumber: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(1),
  input: JsonValueSchema.optional(),
  output: JsonValueSchema.optional(),
  errorMessage: z.string().trim().min(1).optional(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
});

export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;
export type CampaignRunRecord = z.infer<typeof CampaignRunRecordSchema>;
export type CanonicalSitePages = z.infer<typeof CanonicalSitePagesSchema>;
export type ClinicExtractionLanguageProfile = z.infer<typeof ClinicExtractionLanguageProfileSchema>;
export type ClinicStructuredExtraction = z.infer<typeof ClinicStructuredExtractionSchema>;
export type ContactValidationCheck = z.infer<typeof ContactValidationCheckSchema>;
export type ContactValidationCheckName = z.infer<typeof ContactValidationCheckNameSchema>;
export type ContactValidationCheckStatus = z.infer<typeof ContactValidationCheckStatusSchema>;
export type ContactValidation = z.infer<typeof ContactValidationSchema>;
export type CrawlDecision = z.infer<typeof CrawlDecisionSchema>;
export type DemoChatbotConfig = z.infer<typeof DemoChatbotConfigSchema>;
export type DemoLandingPage = z.infer<typeof DemoLandingPageSchema>;
export type DiscoveryProvider = z.infer<typeof DiscoveryProviderSchema>;
export type DiscoveredProspect = z.infer<typeof DiscoveredProspectSchema>;
export type DiscoveryBatch = z.infer<typeof DiscoveryBatchSchema>;
export type ExtractedFact = z.infer<typeof ExtractedFactSchema>;
export type FactSource = z.infer<typeof FactSourceSchema>;
export type KnowledgePack = z.infer<typeof KnowledgePackSchema>;
export type LeadScore = z.infer<typeof LeadScoreSchema>;
export type LanguageAssessment = z.infer<typeof LanguageAssessmentSchema>;
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type LiveDemoEligibility = z.infer<typeof LiveDemoEligibilitySchema>;
export type OutreachEnglishTranslation = z.infer<typeof OutreachEnglishTranslationSchema>;
export type OutreachDraft = z.infer<typeof OutreachDraftSchema>;
export type OutreachVariantStyle = z.infer<typeof OutreachVariantStyleSchema>;
export type PageLanguageAssessment = z.infer<typeof PageLanguageAssessmentSchema>;
export type PipelineStageName = z.infer<typeof PipelineStageNameSchema>;
export type ProspectRunState = z.infer<typeof ProspectRunStateSchema>;
export type PreviewDeployment = z.infer<typeof PreviewDeploymentSchema>;
export type ReviewAuditAction = z.infer<typeof ReviewAuditActionSchema>;
export type ReviewAuditEvent = z.infer<typeof ReviewAuditEventSchema>;
export type ReviewDecisionStatus = z.infer<typeof ReviewDecisionStatusSchema>;
export type ReviewFactOverride = z.infer<typeof ReviewFactOverrideSchema>;
export type ReviewFactOverrideValueMode = z.infer<typeof ReviewFactOverrideValueModeSchema>;
export type ReviewRecord = z.infer<typeof ReviewRecordSchema>;
export type RobotsPolicy = z.infer<typeof RobotsPolicySchema>;
export type MapEmbedConfiguration = z.infer<typeof MapEmbedConfigurationSchema>;
export type SiteContactCandidate = z.infer<typeof SiteContactCandidateSchema>;
export type SiteCrawlReport = z.infer<typeof SiteCrawlReportSchema>;
export type SiteForm = z.infer<typeof SiteFormSchema>;
export type SiteHeading = z.infer<typeof SiteHeadingSchema>;
export type SiteImageReference = z.infer<typeof SiteImageReferenceSchema>;
export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;
export type SitePageSnapshot = z.infer<typeof SitePageSnapshotSchema>;
export type SitePageType = z.infer<typeof SitePageTypeSchema>;
export type SiteSnapshot = z.infer<typeof SiteSnapshotSchema>;
export type SiteVisibleElements = z.infer<typeof SiteVisibleElementsSchema>;
export type StageAttemptRecord = z.infer<typeof StageAttemptRecordSchema>;
export type StructuredClinicField = z.infer<typeof StructuredClinicFieldSchema>;
export type StructuredFieldStatus = z.infer<typeof StructuredFieldStatusSchema>;
export type StructuredBusinessData = z.infer<typeof StructuredBusinessDataSchema>;
export type WebsiteCrawlResult = z.infer<typeof WebsiteCrawlResultSchema>;
export type WebsiteGrade = z.infer<typeof WebsiteGradeSchema>;
export type WebsiteGradeCategoryScore = z.infer<typeof WebsiteGradeCategoryScoreSchema>;
export type WebsiteGradeCategoryScores = z.infer<typeof WebsiteGradeCategoryScoresSchema>;
export type WebsiteGradeInsight = z.infer<typeof WebsiteGradeInsightSchema>;
export type WebsiteLink = z.infer<typeof WebsiteLinkSchema>;
