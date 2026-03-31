import type { CampaignConfig } from "@/lib/antigravity/schemas";
import type { DiscoverySourceBatch } from "@/lib/antigravity/discovery/schemas";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";

export interface LeadDiscoverySource {
  readonly sourceName: string;
  discoverCandidates(args: {
    campaign: CampaignConfig;
    logger: AntigravityLogger;
  }): Promise<DiscoverySourceBatch>;
}
