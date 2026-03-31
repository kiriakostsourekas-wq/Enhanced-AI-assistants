import { DiscoveryBatchSchema } from "@/lib/antigravity/schemas";
import type { CampaignStage } from "@/lib/antigravity/stages/interfaces";

export const discoverProspectsStage: CampaignStage<typeof DiscoveryBatchSchema> = {
  name: "discover_prospects",
  outputSchema: DiscoveryBatchSchema,
  retryPolicy: {
    attempts: 2,
    baseDelayMs: 250,
    maxDelayMs: 1_000,
  },
  async execute(context) {
    return context.dependencies.prospectDiscovery.discoverProspects({
      campaign: context.campaign,
      logger: context.logger.child({ stage: "discover_prospects" }),
    });
  },
};
