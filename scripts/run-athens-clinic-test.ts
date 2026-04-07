import path from "node:path";
import util from "node:util";
import { access } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { createDefaultAntigravityDependencies } from "@/lib/antigravity/dependencies";
import { getAntigravityEnv } from "@/lib/antigravity/config";
import { AntigravityCampaignOrchestrator } from "@/lib/antigravity/orchestrator/orchestrator";
import { InMemoryAntigravityRepository } from "@/lib/antigravity/persistence/in-memory-repository";
import { PostgresAntigravityRepository } from "@/lib/antigravity/persistence/postgres-repository";
import { createAntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { nowIso, slugify } from "@/lib/antigravity/runtime/utils";
import { CampaignConfigSchema } from "@/lib/antigravity/schemas";

const DEFAULT_SELECTORS = ["retinaeyeclinic.gr", "synovus.gr", "athensdentalspecialists.gr"] as const;
const DATASET_PATH = "clinics/athens_clinics_leads.csv";
const PREVIEW_ROUTE_PREFIX = "/antigravity-previews";
const REVIEW_ROUTE_PREFIX = "/antigravity-review";

function uniqueCampaignId() {
  const compactIso = nowIso().replace(/[-:]/g, "").replace(/\.\d+Z$/, "z").toLowerCase();
  return `athens-clinic-test-${compactIso}`;
}

function selectedLeadSelectors() {
  const selectors = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const finalSelectors = selectors.length > 0 ? selectors : [...DEFAULT_SELECTORS];

  if (finalSelectors.length < 3 || finalSelectors.length > 5) {
    throw new Error("Athens clinic test runs must select between 3 and 5 clinics.");
  }

  return finalSelectors;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  loadEnvConfig(process.cwd());

  const env = getAntigravityEnv();
  const logger = createAntigravityLogger({ app: "athens-clinic-test-runner" });
  const leadSelectors = selectedLeadSelectors();
  const campaignId = uniqueCampaignId();
  const previewBaseUrl = env.ANTIGRAVITY_PREVIEW_BASE_URL.replace(/\/$/, "");
  const repository = env.ANTIGRAVITY_DATABASE_URL
    ? new PostgresAntigravityRepository({ connectionString: env.ANTIGRAVITY_DATABASE_URL })
    : new InMemoryAntigravityRepository();

  const campaign = CampaignConfigSchema.parse({
    campaignId,
    displayName: "Athens Clinic Tiny Test Run",
    vertical: "appointment-based smb",
    geography: {
      countryCode: "GR",
      region: "Attica",
      city: "Athens",
      radiusKm: 20,
    },
    targetLeadCount: leadSelectors.length,
    maxDemoCount: leadSelectors.length,
    outreachMode: "draft_only",
    discovery: {
      provider: "appointment_smb_csv",
      csvDatasetPath: DATASET_PATH,
      leadSelectors,
      minimumOverallScore: 0.45,
      excludeDomains: [],
      excludeBusinessNames: [],
      seedQueries: [],
      seedProspects: [],
    },
    deployment: {
      previewRoutePrefix: PREVIEW_ROUTE_PREFIX,
    },
    schedule: {
      cron: "manual",
      timezone: "Europe/Athens",
    },
    metadata: {
      mode: "tiny_test",
      selectors: leadSelectors.join(","),
    },
  });

  const orchestrator = new AntigravityCampaignOrchestrator({
    repository,
    dependencies: createDefaultAntigravityDependencies(),
    logger,
    previewBaseUrl,
  });

  logger.info("athens_clinic_test_run_starting", {
    campaignId,
    leadSelectors,
    repository: env.ANTIGRAVITY_DATABASE_URL ? "postgres" : "in-memory",
  });

  const run = await orchestrator.runCampaign(campaign);
  logger.info("athens_clinic_test_run_orchestrator_finished", {
    campaignId: run.campaignId,
    runId: run.runId,
    status: run.status,
  });
  const prospects = await repository.listProspectsForRun(run.runId);
  const campaignSlug = slugify(run.campaignId);

  const processedNames = prospects.map((prospect) => prospect.prospect.businessName);
  const passedGrading = prospects
    .filter((prospect) => prospect.websiteGrade?.demoOpportunityGate)
    .map((prospect) => prospect.prospect.businessName);
  const liveDemoProspects = prospects
    .filter((prospect) => prospect.landingPage?.renderingMode === "live_demo")
    .map((prospect) => prospect.prospect.businessName);
  const conceptDemoProspects = prospects
    .filter((prospect) => prospect.landingPage?.renderingMode === "concept_demo")
    .map((prospect) => prospect.prospect.businessName);

  const previewSummaries = await Promise.all(
    prospects
      .filter((prospect) => prospect.previewDeployment?.previewUrl)
      .map(async (prospect) => {
        const prospectSlug = slugify(prospect.prospect.businessName);
        const artifactDirectory = prospect.previewDeployment?.artifactDirectory ?? "";
        const reviewRecordPath = path.join(process.cwd(), "artifacts", "antigravity-review", campaignSlug, prospectSlug, "review-state.json");

        return {
          businessName: prospect.prospect.businessName,
          renderMode: prospect.landingPage?.renderingMode ?? "unknown",
          previewUrl: prospect.previewDeployment?.previewUrl ?? `${previewBaseUrl}${PREVIEW_ROUTE_PREFIX}/${campaignSlug}/${prospectSlug}`,
          reviewUrl: `${previewBaseUrl}${REVIEW_ROUTE_PREFIX}/${campaignSlug}/${prospectSlug}`,
          artifactDirectory,
          artifactReady: artifactDirectory ? await fileExists(path.join(artifactDirectory, "landing-page.json")) : false,
          reviewRecordPath,
          reviewRecordReady: await fileExists(reviewRecordPath),
        };
      }),
  );

  const failures = prospects
    .filter((prospect) => prospect.status === "failed" || prospect.status === "blocked")
    .map((prospect) => ({
      businessName: prospect.prospect.businessName,
      status: prospect.status,
      reason: prospect.blockingReason ?? "Unknown failure",
    }));

  console.log("");
  console.log("Athens clinic tiny test run complete");
  console.log(`Campaign ID: ${run.campaignId}`);
  console.log(`Campaign slug: ${campaignSlug}`);
  console.log(`Run ID: ${run.runId}`);
  console.log(`Repository: ${env.ANTIGRAVITY_DATABASE_URL ? "postgres" : "in-memory"}`);
  console.log(`Lead selectors: ${leadSelectors.join(", ")}`);
  console.log("");
  console.log(`Processed clinics (${processedNames.length}):`);
  for (const name of processedNames) {
    console.log(`- ${name}`);
  }
  console.log("");
  console.log(`Passed grading (${passedGrading.length}): ${passedGrading.length > 0 ? passedGrading.join(" | ") : "none"}`);
  console.log(`Live demo (${liveDemoProspects.length}): ${liveDemoProspects.length > 0 ? liveDemoProspects.join(" | ") : "none"}`);
  console.log(`Concept demo (${conceptDemoProspects.length}): ${conceptDemoProspects.length > 0 ? conceptDemoProspects.join(" | ") : "none"}`);
  console.log("");
  console.log(`Preview URLs (${previewSummaries.length}):`);
  for (const preview of previewSummaries) {
    console.log(`- ${preview.businessName}`);
    console.log(`  preview: ${preview.previewUrl}`);
    console.log(`  review: ${preview.reviewUrl}`);
    console.log(`  render_mode: ${preview.renderMode}`);
    console.log(`  preview_artifacts: ${preview.artifactReady ? "ready" : "missing"} (${preview.artifactDirectory || "n/a"})`);
    console.log(`  review_record: ${preview.reviewRecordReady ? "ready" : "missing"} (${preview.reviewRecordPath})`);
  }
  console.log("");
  console.log(`Failures (${failures.length}):`);
  if (failures.length === 0) {
    console.log("- none");
  } else {
    for (const failure of failures) {
      console.log(`- ${failure.businessName} [${failure.status}] ${failure.reason}`);
    }
  }
  console.log("");
  console.log(`Review queue: ${previewBaseUrl}/antigravity-review`);
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "athens_clinic_test_run_failed",
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined,
      rawError: util.inspect(error, { depth: 6 }),
      timestamp: new Date().toISOString(),
    }),
  );
  process.exitCode = 1;
});
