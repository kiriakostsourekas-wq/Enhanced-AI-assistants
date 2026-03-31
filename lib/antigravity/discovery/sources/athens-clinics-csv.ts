import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";
import type { LeadDiscoverySource } from "@/lib/antigravity/discovery/sources/interfaces";
import { DiscoverySourceBatchSchema, DiscoverySourceCandidateSchema } from "@/lib/antigravity/discovery/schemas";
import { parseCsv } from "@/lib/antigravity/discovery/csv";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";

const DEFAULT_DATASET_PATH = fileURLToPath(new URL("../../../../clinics/athens_clinics_leads.csv", import.meta.url));

const AthensClinicCsvRowSchema = z.object({
  business_name: z.string().trim().min(1),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  official_website: z.string().trim().optional(),
  address: z.string().trim().optional(),
  category: z.string().trim().optional(),
  google_maps_url: z.string().trim().optional(),
  email_source_url: z.string().trim().optional(),
  email_confidence: z.string().trim().optional(),
});

function resolveDatasetPath(inputPath?: string) {
  return inputPath ? path.resolve(process.cwd(), inputPath) : DEFAULT_DATASET_PATH;
}

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

export class AthensClinicsCsvDiscoverySource implements LeadDiscoverySource {
  readonly sourceName = "athens_clinics_csv";

  async discoverCandidates({ campaign, logger }: Parameters<LeadDiscoverySource["discoverCandidates"]>[0]) {
    const datasetPath = resolveDatasetPath(campaign.discovery.csvDatasetPath);
    logger.info("loading_athens_clinics_csv_source", { datasetPath });

    const contents = await readFile(datasetPath, "utf8").catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        throw new Error(
          `Athens clinics CSV dataset was not found at ${datasetPath}. Keep real clinic lead data local only and copy clinics/athens_clinics_leads.template.csv to clinics/athens_clinics_leads.csv, or set discovery.csvDatasetPath to your local file.`,
        );
      }

      throw error;
    });
    const rows = parseCsv(contents).map((row) => AthensClinicCsvRowSchema.parse(row));

    const candidates = rows.map((row, index) =>
      DiscoverySourceCandidateSchema.parse({
        externalId: `athens-clinic-${index + 1}`,
        businessName: row.business_name,
        category: row.category || undefined,
        address: row.address || undefined,
        phone: row.phone || undefined,
        visibleEmail: validOptionalEmail(row.email),
        websiteUrl: validOptionalUrl(row.website),
        officialWebsiteUrl: validOptionalUrl(row.official_website),
        contactPageUrl: validOptionalUrl(row.email_source_url),
        mapsUrl: validOptionalUrl(row.google_maps_url),
        sourceUrl:
          validOptionalUrl(row.google_maps_url) ??
          validOptionalUrl(row.official_website) ??
          validOptionalUrl(row.website) ??
          "https://www.google.com/maps",
        sourceName: this.sourceName,
        notes: row.email_confidence ? `email_confidence=${row.email_confidence}` : undefined,
        confidence: 0.88,
        provenance: [
          buildFactSource({
            sourceType: "discovery_provider",
            label: "Athens clinics CSV row",
            uri:
              validOptionalUrl(row.google_maps_url) ??
              validOptionalUrl(row.official_website) ??
              validOptionalUrl(row.website) ??
              `file:${datasetPath}`,
            excerpt: row.business_name,
          }),
        ],
      }),
    );

    return DiscoverySourceBatchSchema.parse({
      sourceName: this.sourceName,
      candidates,
    });
  }
}
