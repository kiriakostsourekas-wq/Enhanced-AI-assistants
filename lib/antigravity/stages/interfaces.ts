import type { ZodTypeAny } from "zod";
import type {
  CampaignConfig,
  CampaignRunRecord,
  DiscoveryBatch,
  PipelineStageName,
  ProspectRunState,
} from "@/lib/antigravity/schemas";
import type { AntigravityRepository } from "@/lib/antigravity/persistence/repository";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";
import type { RetryPolicy } from "@/lib/antigravity/runtime/retry";

export interface ProspectDiscoveryProvider {
  discoverProspects(args: {
    campaign: CampaignConfig;
    logger: AntigravityLogger;
  }): Promise<DiscoveryBatch>;
}

export interface OutreachSender {
  sendDraft(args: {
    campaign: CampaignConfig;
    prospectState: ProspectRunState;
    logger: AntigravityLogger;
  }): Promise<{ sentAt: string }>;
}

export type AntigravityDependencies = {
  prospectDiscovery: ProspectDiscoveryProvider;
  outreachSender?: OutreachSender;
};

export type StageRuntimeContext = {
  run: CampaignRunRecord;
  campaign: CampaignConfig;
  repository: AntigravityRepository;
  logger: AntigravityLogger;
  previewBaseUrl: string;
  previewRoutePrefix: string;
};

export interface CampaignStage<OutputSchema extends ZodTypeAny> {
  name: Extract<PipelineStageName, "discover_prospects">;
  outputSchema: OutputSchema;
  retryPolicy: RetryPolicy;
  execute(context: StageRuntimeContext & { dependencies: AntigravityDependencies }): Promise<OutputSchema["_output"]>;
}

export interface ProspectStage<OutputSchema extends ZodTypeAny> {
  name: Exclude<PipelineStageName, "discover_prospects">;
  inputSchema: ZodTypeAny;
  outputSchema: OutputSchema;
  retryPolicy: RetryPolicy;
  execute(
    input: ProspectRunState,
    context: StageRuntimeContext & { dependencies: AntigravityDependencies },
  ): Promise<OutputSchema["_output"]>;
  apply(state: ProspectRunState, output: OutputSchema["_output"]): ProspectRunState;
}
