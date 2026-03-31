import { z } from "zod";
import { ConfidenceScoreSchema, FactSourceSchema } from "@/lib/antigravity/schemas";

export const DiscoverySourceCandidateSchema = z.object({
  externalId: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  category: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  visibleEmail: z.string().email().optional(),
  websiteUrl: z.string().url().optional(),
  officialWebsiteUrl: z.string().url().optional(),
  contactPageUrl: z.string().url().optional(),
  mapsUrl: z.string().url().optional(),
  sourceUrl: z.string().url(),
  sourceName: z.string().trim().min(1),
  notes: z.string().trim().min(1).optional(),
  confidence: ConfidenceScoreSchema,
  provenance: z.array(FactSourceSchema).min(1),
});

export const DiscoverySourceBatchSchema = z.object({
  sourceName: z.string().trim().min(1),
  candidates: z.array(DiscoverySourceCandidateSchema),
});

export type DiscoverySourceCandidate = z.infer<typeof DiscoverySourceCandidateSchema>;
export type DiscoverySourceBatch = z.infer<typeof DiscoverySourceBatchSchema>;
