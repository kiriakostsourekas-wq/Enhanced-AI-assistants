import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";
import type { LeadDiscoverySource } from "@/lib/antigravity/discovery/sources/interfaces";
import { DiscoverySourceBatchSchema, DiscoverySourceCandidateSchema } from "@/lib/antigravity/discovery/schemas";
import { parseCsv } from "@/lib/antigravity/discovery/csv";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";

const DEFAULT_DATASET_PATH = fileURLToPath(new URL("../../../../clinics/athens_clinics_leads.csv", import.meta.url));

const AthensClinicCsvRowSchema = z.object({
  business_name: z.string().trim().min(1),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  official_website: z.string().trim().optional(),
  resolved_website: z.string().trim().optional(),
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

function rowSelectorTokens(row: z.infer<typeof AthensClinicCsvRowSchema>, rowIndex: number) {
  const externalId = `athens-clinic-${rowIndex + 1}`;
  const businessSlug = slugify(row.business_name);

  return new Set(
    [
      String(rowIndex + 1),
      externalId,
      `row:${rowIndex + 1}`,
      `id:${externalId}`,
      normalizeSelector(row.business_name),
      businessSlug,
      businessSlug ? `slug:${businessSlug}` : undefined,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeSelector(value)),
  );
}

function selectorDomainMatches(selector: string, domains: string[]) {
  return domains.some((domain) => selector === domain || selector === `domain:${domain}`);
}

function selectorMatchRank(row: z.infer<typeof AthensClinicCsvRowSchema>, rowIndex: number, selector: string) {
  const rowTokens = rowSelectorTokens(row, rowIndex);
  if (rowTokens.has(selector)) {
    return 3;
  }

  const primaryDomains = [safeDomain(row.website), safeDomain(row.resolved_website)].filter(Boolean) as string[];
  if (selectorDomainMatches(selector, primaryDomains)) {
    return 2;
  }

  const fallbackDomains = [safeDomain(row.official_website)].filter(Boolean) as string[];
  if (selectorDomainMatches(selector, fallbackDomains)) {
    return 1;
  }

  return null;
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
    const selectorSet = new Set(campaign.discovery.leadSelectors.map((selector) => normalizeSelector(selector)));
    const selectedRows =
      selectorSet.size === 0
        ? rows.map((row, rowIndex) => ({ row, rowIndex }))
        : [...selectorSet].map((selector) => {
            const rankedMatches = rows.flatMap((row, rowIndex) => {
              const rank = selectorMatchRank(row, rowIndex, selector);
              return rank === null ? [] : [{ row, rowIndex, rank }];
            });

            if (rankedMatches.length === 0) {
              throw new Error(`Athens clinics CSV selection returned no match for selector: ${selector}.`);
            }

            const bestRank = Math.max(...rankedMatches.map((match) => match.rank));
            const bestMatches = rankedMatches.filter((match) => match.rank === bestRank);

            if (bestMatches.length > 1) {
              throw new Error(
                `Athens clinics CSV selector "${selector}" is ambiguous. Matches: ${bestMatches
                  .map((match) => `${match.row.business_name} (row ${match.rowIndex + 1})`)
                  .join("; ")}.`,
              );
            }

            const [{ row, rowIndex }] = bestMatches;
            return { row, rowIndex };
          });

    if (selectorSet.size > 0 && selectedRows.length === 0) {
      throw new Error(
        `Athens clinics CSV selection returned no matches for selectors: ${campaign.discovery.leadSelectors.join(", ")}.`,
      );
    }

    const uniqueSelectedRows = Array.from(
      new Map(selectedRows.map((match) => [match.rowIndex, match])).values(),
    );

    if (selectorSet.size > 0 && uniqueSelectedRows.length !== selectedRows.length) {
      throw new Error(
        `Athens clinics CSV selectors resolved to ${uniqueSelectedRows.length} unique rows from ${selectedRows.length} selectors. Use one selector per clinic.`,
      );
    }

    logger.info("athens_clinics_csv_rows_selected", {
      totalRows: rows.length,
      selectedRows: uniqueSelectedRows.length,
      selectors: campaign.discovery.leadSelectors,
    });

    const candidates = uniqueSelectedRows.map(({ row, rowIndex }) =>
      DiscoverySourceCandidateSchema.parse({
        externalId: `athens-clinic-${rowIndex + 1}`,
        businessName: row.business_name,
        category: row.category || undefined,
        address: row.address || undefined,
        phone: row.phone || undefined,
        visibleEmail: validOptionalEmail(row.email),
        websiteUrl: validOptionalUrl(row.website),
        officialWebsiteUrl: validOptionalUrl(row.official_website) ?? validOptionalUrl(row.resolved_website),
        contactPageUrl: validOptionalUrl(row.email_source_url),
        mapsUrl: validOptionalUrl(row.google_maps_url),
        sourceUrl:
          validOptionalUrl(row.google_maps_url) ??
          validOptionalUrl(row.official_website) ??
          validOptionalUrl(row.resolved_website) ??
          validOptionalUrl(row.website) ??
          "https://www.google.com/maps",
        sourceName: this.sourceName,
        notes: [row.email_confidence ? `email_confidence=${row.email_confidence}` : undefined, `csv_row=${rowIndex + 1}`]
          .filter(Boolean)
          .join(" "),
        confidence: 0.88,
        provenance: [
          buildFactSource({
            sourceType: "discovery_provider",
            label: "Athens clinics CSV row",
            uri:
              validOptionalUrl(row.google_maps_url) ??
              validOptionalUrl(row.official_website) ??
              validOptionalUrl(row.resolved_website) ??
              validOptionalUrl(row.website) ??
              `file:${datasetPath}`,
            excerpt: `${row.business_name} (row ${rowIndex + 1})`,
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
