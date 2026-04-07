import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { createDefaultAntigravityDependencies } from "@/lib/antigravity/dependencies";
import { getAntigravityEnv } from "@/lib/antigravity/config";
import { InMemoryAntigravityRepository } from "@/lib/antigravity/persistence/in-memory-repository";
import { PostgresAntigravityRepository } from "@/lib/antigravity/persistence/postgres-repository";
import { AntigravityCampaignOrchestrator } from "@/lib/antigravity/orchestrator/orchestrator";
import { createAntigravityLogger } from "@/lib/antigravity/runtime/logger";

function resolveConfigPath(cliValue?: string) {
  if (cliValue) {
    return path.resolve(process.cwd(), cliValue);
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, "../examples/antigravity/athens-dental.json");
}

async function main() {
  loadEnvConfig(process.cwd());

  const configPath = resolveConfigPath(process.argv[2]);
  const env = getAntigravityEnv();
  const logger = createAntigravityLogger({ app: "antigravity-runner" });
  const rawConfig = await readFile(configPath, "utf8");
  const config = JSON.parse(rawConfig);

  const repository = env.ANTIGRAVITY_DATABASE_URL
    ? new PostgresAntigravityRepository({ connectionString: env.ANTIGRAVITY_DATABASE_URL })
    : new InMemoryAntigravityRepository();

  const orchestrator = new AntigravityCampaignOrchestrator({
    repository,
    dependencies: createDefaultAntigravityDependencies(),
    logger,
    previewBaseUrl: env.ANTIGRAVITY_PREVIEW_BASE_URL,
  });

  const result = await orchestrator.runCampaign(config);
  logger.info("campaign_run_finished", {
    runId: result.runId,
    campaignId: result.campaignId,
    status: result.status,
  });
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: "antigravity_runner_failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }),
  );
  process.exitCode = 1;
});
