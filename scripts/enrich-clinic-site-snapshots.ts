import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseCsv, stringifyCsvRows } from "@/lib/antigravity/discovery/csv";
import { createSiteSnapshot } from "@/lib/antigravity/site-snapshot";
import { createAntigravityLogger } from "@/lib/antigravity/runtime/logger";

const DEFAULT_CSV_PATH = fileURLToPath(new URL("../clinics/athens_clinics_leads.csv", import.meta.url));
const EXCLUDED_HOST_PATTERNS = [
  /google\.com$/i,
  /instagram\.com$/i,
  /facebook\.com$/i,
  /linkedin\.com$/i,
  /x\.com$/i,
  /twitter\.com$/i,
  /wixsite\.com$/i,
];
const DEFAULT_WORKER_COUNT = 3;

type ClinicCsvRow = Record<string, string>;

function resolveCsvPath(cliValue?: string) {
  return cliValue ? path.resolve(process.cwd(), cliValue) : DEFAULT_CSV_PATH;
}

function isValidUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function looksLikeExcludedHost(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./i, "");
  return EXCLUDED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function pickWebsiteUrl(row: ClinicCsvRow) {
  const candidates = [row.official_website, row.website].filter(isValidUrl) as string[];
  return candidates.find((candidate) => !looksLikeExcludedHost(candidate));
}

function relativeToRepo(filePath?: string) {
  if (!filePath) {
    return "";
  }

  return path.relative(process.cwd(), filePath);
}

function joinList(values: string[], limit = 10) {
  return values.slice(0, limit).join(" | ");
}

function pickPrimaryValue(values: string[]) {
  return values[0] ?? "";
}

function formSignals(forms: Array<{ purposeHint: string; fieldNames: string[] }>) {
  return forms
    .map((form) => `${form.purposeHint}:${form.fieldNames.slice(0, 5).join("/")}`)
    .filter(Boolean)
    .slice(0, 8)
    .join(" | ");
}

function emptySnapshotColumns(row: ClinicCsvRow, overrides: Record<string, string>) {
  return {
    ...row,
    snapshot_status: "not_available",
    snapshot_blocked_reason: "",
    snapshot_domain: "",
    snapshot_artifact_directory: "",
    snapshot_report_path: "",
    snapshot_homepage_url: "",
    snapshot_about_url: "",
    snapshot_services_url: "",
    snapshot_contact_url: "",
    snapshot_booking_url: "",
    snapshot_team_url: "",
    snapshot_faq_url: "",
    snapshot_title: "",
    snapshot_meta_description: "",
    snapshot_primary_phone: "",
    snapshot_primary_email: "",
    snapshot_primary_address: "",
    snapshot_visible_phones: "",
    snapshot_visible_emails: "",
    snapshot_visible_addresses: "",
    snapshot_contact_candidates: "",
    snapshot_social_links: "",
    snapshot_main_images: "",
    snapshot_form_signals: "",
    snapshot_screenshot_homepage: "",
    snapshot_screenshot_contact: "",
    snapshot_screenshot_booking: "",
    snapshot_fetched_page_count: "0",
    snapshot_skipped_count: "0",
    snapshot_screenshot_status: "not_requested",
    ...overrides,
  };
}

function mapSnapshotRow(row: ClinicCsvRow, snapshotResult: Awaited<ReturnType<typeof createSiteSnapshot>>) {
  const websiteUrl = pickWebsiteUrl(row);
  if (!websiteUrl) {
    return emptySnapshotColumns(row, {
      snapshot_status: "not_available",
      snapshot_blocked_reason: "No crawlable official website was available in the dataset.",
    });
  }

  if (snapshotResult.status === "blocked") {
    return emptySnapshotColumns(row, {
      snapshot_status: "blocked",
      snapshot_blocked_reason: snapshotResult.blockedReason,
      snapshot_domain: new URL(websiteUrl).hostname.replace(/^www\./i, ""),
      snapshot_fetched_page_count: String(snapshotResult.crawlReport.fetchedPageCount),
      snapshot_skipped_count: String(snapshotResult.crawlReport.skippedCount),
      snapshot_screenshot_status: snapshotResult.crawlReport.screenshotStatus,
    });
  }

  const snapshot = snapshotResult.snapshot;
  const phones = snapshot.extractedVisibleElements.phones;
  const emails = snapshot.extractedVisibleElements.emails;
  const addresses = snapshot.extractedVisibleElements.addresses;
  const contactCandidates = snapshot.contactCandidates.map((candidate) => `${candidate.type}:${candidate.value}`);
  const reportPath = path.join(snapshot.artifactDirectory, "crawl-report.json");

  return {
    ...emptySnapshotColumns(row, {}),
    snapshot_status: "success",
    snapshot_domain: snapshot.domain,
    snapshot_artifact_directory: relativeToRepo(snapshot.artifactDirectory),
    snapshot_report_path: relativeToRepo(reportPath),
    snapshot_homepage_url: snapshot.canonicalPages.homepage?.finalUrl ?? "",
    snapshot_about_url: snapshot.canonicalPages.about?.finalUrl ?? "",
    snapshot_services_url: snapshot.canonicalPages.services?.finalUrl ?? "",
    snapshot_contact_url: snapshot.canonicalPages.contact?.finalUrl ?? "",
    snapshot_booking_url: snapshot.canonicalPages.booking?.finalUrl ?? "",
    snapshot_team_url: snapshot.canonicalPages.team?.finalUrl ?? "",
    snapshot_faq_url: snapshot.canonicalPages.faq?.finalUrl ?? "",
    snapshot_title: snapshot.metadata.title ?? "",
    snapshot_meta_description: snapshot.metadata.metaDescription ?? "",
    snapshot_primary_phone: pickPrimaryValue(phones),
    snapshot_primary_email: pickPrimaryValue(emails),
    snapshot_primary_address: pickPrimaryValue(addresses),
    snapshot_visible_phones: joinList(phones),
    snapshot_visible_emails: joinList(emails),
    snapshot_visible_addresses: joinList(addresses, 6),
    snapshot_contact_candidates: joinList(contactCandidates, 12),
    snapshot_social_links: joinList(snapshot.extractedVisibleElements.socialLinks.map((link) => link.href)),
    snapshot_main_images: joinList(snapshot.imageReferences.map((image) => image.url), 12),
    snapshot_form_signals: formSignals(snapshot.extractedVisibleElements.forms),
    snapshot_screenshot_homepage: relativeToRepo(snapshot.canonicalPages.homepage?.screenshotPath),
    snapshot_screenshot_contact: relativeToRepo(snapshot.canonicalPages.contact?.screenshotPath),
    snapshot_screenshot_booking: relativeToRepo(snapshot.canonicalPages.booking?.screenshotPath),
    snapshot_fetched_page_count: String(snapshot.crawlReport.fetchedPageCount),
    snapshot_skipped_count: String(snapshot.crawlReport.skippedCount),
    snapshot_screenshot_status: snapshot.crawlReport.screenshotStatus,
  };
}

async function main() {
  const csvPath = resolveCsvPath(process.argv[2]);
  const logger = createAntigravityLogger({ app: "clinic-site-snapshot-enrichment" });
  const rawCsv = await readFile(csvPath, "utf8");
  const rows = parseCsv(rawCsv) as ClinicCsvRow[];
  const outputRows: ClinicCsvRow[] = new Array(rows.length);
  const workerCount = Number(process.env.CLINIC_SNAPSHOT_WORKERS ?? DEFAULT_WORKER_COUNT);

  let processedCount = 0;
  let successCount = 0;
  let blockedCount = 0;
  let skippedCount = 0;
  let nextRowIndex = 0;

  async function runWorker(workerId: number) {
    while (true) {
      const currentIndex = nextRowIndex;
      nextRowIndex += 1;

      if (currentIndex >= rows.length) {
        return;
      }

      const row = rows[currentIndex];
      const websiteUrl = pickWebsiteUrl(row);
      const rowLogger = logger.child({
        businessName: row.business_name,
        index: currentIndex + 1,
        total: rows.length,
        websiteUrl,
        workerId,
      });
      rowLogger.info("snapshot_row_started");

      let mappedRow: ClinicCsvRow;
      if (!websiteUrl) {
        mappedRow = emptySnapshotColumns(row, {
          snapshot_status: "not_available",
          snapshot_blocked_reason: "No crawlable official website was available in the dataset.",
        });
        skippedCount += 1;
        outputRows[currentIndex] = mappedRow;
        processedCount += 1;
        continue;
      }

      const snapshotResult = await createSiteSnapshot({
        websiteUrl,
        logger: rowLogger,
        maxPages: 6,
        timeoutMs: 10_000,
        rateLimitMs: 1_500,
        captureScreenshots: true,
      });

      mappedRow = mapSnapshotRow(row, snapshotResult);
      outputRows[currentIndex] = mappedRow;
      processedCount += 1;

      if (snapshotResult.status === "success") {
        successCount += 1;
      } else {
        blockedCount += 1;
      }

      rowLogger.info("snapshot_row_finished", {
        processedCount,
        snapshotStatus: mappedRow.snapshot_status,
        fetchedPageCount: mappedRow.snapshot_fetched_page_count,
        skippedPageCount: mappedRow.snapshot_skipped_count,
      });
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, workerCount) }, (_, index) => runWorker(index + 1)));

  const csvOutput = `\ufeff${stringifyCsvRows(outputRows)}\n`;
  await writeFile(csvPath, csvOutput, "utf8");

  logger.info("clinic_snapshot_enrichment_finished", {
    csvPath,
    workerCount,
    processedCount,
    successCount,
    blockedCount,
    skippedCount,
  });
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "clinic_site_snapshot_enrichment_failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }),
  );
  process.exitCode = 1;
});
