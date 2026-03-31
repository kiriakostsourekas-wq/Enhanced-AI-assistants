import { CampaignConfigSchema, CampaignRunRecordSchema, ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import type {
  CampaignConfig,
  CampaignRunRecord,
  ProspectRunState,
} from "@/lib/antigravity/schemas";
import type { AntigravityRepository } from "@/lib/antigravity/persistence/repository";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { createAttemptId, createIdempotencyKey, createRunId } from "@/lib/antigravity/runtime/idempotency";
import { nowIso } from "@/lib/antigravity/runtime/utils";
import type { AntigravityDependencies } from "@/lib/antigravity/stages/interfaces";
import { runCampaignStage } from "@/lib/antigravity/runtime/stage-runner";
import { discoverProspectsStage } from "@/lib/antigravity/stages/discover-prospects";
import { createProspectPipeline } from "@/lib/antigravity/orchestrator/create-pipeline";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";

type OrchestratorArgs = {
  repository: AntigravityRepository;
  dependencies: AntigravityDependencies;
  logger: AntigravityLogger;
  previewBaseUrl: string;
};

export class AntigravityCampaignOrchestrator {
  constructor(private readonly args: OrchestratorArgs) {}

  private buildRunRecord(campaign: CampaignConfig): CampaignRunRecord {
    const now = nowIso();

    return CampaignRunRecordSchema.parse({
      runId: createRunId(),
      campaignId: campaign.campaignId,
      idempotencyKey: createIdempotencyKey({
        campaignId: campaign.campaignId,
        scope: "campaign-run",
        scheduleDate: now.slice(0, 10),
      }),
      status: "running",
      scheduledFor: now,
      startedAt: now,
      config: campaign,
      summary: {
        requestedLeadCount: campaign.targetLeadCount,
        maxDemoCount: campaign.maxDemoCount,
      },
    });
  }

  private async persistCampaignSummary(run: CampaignRunRecord, prospects: ProspectRunState[]) {
    const awaitingReview = prospects.filter((prospect) => prospect.status === "awaiting_review").length;
    const completed = prospects.filter((prospect) => prospect.status === "completed").length;
    const blocked = prospects.filter((prospect) => prospect.status === "blocked").length;
    const failed = prospects.filter((prospect) => prospect.status === "failed").length;
    const status =
      failed > 0
        ? "failed"
        : awaitingReview > 0
          ? "awaiting_review"
          : completed > 0
            ? "completed"
            : blocked > 0
              ? "failed"
              : "completed";

    const finalRun = CampaignRunRecordSchema.parse({
      ...run,
      status,
      completedAt: nowIso(),
      summary: {
        ...run.summary,
        discoveredProspects: prospects.length,
        completedProspects: completed,
        blockedProspects: blocked,
        failedProspects: failed,
        awaitingReviewProspects: awaitingReview,
      },
    });

    await this.args.repository.saveCampaignRun(finalRun);
    return finalRun;
  }

  async runCampaign(configInput: unknown) {
    const campaign = CampaignConfigSchema.parse(configInput);

    const existing = await this.args.repository.findCampaignRunByIdempotencyKey(
      createIdempotencyKey({
        campaignId: campaign.campaignId,
        scope: "campaign-run",
        scheduleDate: nowIso().slice(0, 10),
      }),
    );

    if (existing) {
      this.args.logger.info("campaign_run_skipped_existing_idempotency_key", {
        campaignId: campaign.campaignId,
        runId: existing.runId,
      });
      return existing;
    }

    const run = this.buildRunRecord(campaign);
    await this.args.repository.saveCampaignRun(run);

    const context = {
      campaign,
      run,
      repository: this.args.repository,
      logger: this.args.logger.child({ campaignId: campaign.campaignId, runId: run.runId }),
      previewBaseUrl: this.args.previewBaseUrl,
      previewRoutePrefix: campaign.deployment.previewRoutePrefix,
      dependencies: this.args.dependencies,
    };

    const discoveryBatch = await runCampaignStage(discoverProspectsStage, context);
    const prospectsToProcess = discoveryBatch.prospects.slice(0, campaign.maxDemoCount);

    const finalProspects: ProspectRunState[] = [];

    for (const prospect of prospectsToProcess) {
      const initialState = ProspectRunStateSchema.parse({
        runId: run.runId,
        campaignId: campaign.campaignId,
        prospect,
        status: "queued",
      });

      await this.args.repository.saveProspectState(initialState);

      const pipeline = createProspectPipeline(context);

      try {
        let finalState = await pipeline.invoke(initialState);

        if (
          campaign.outreachMode === "auto_send" &&
          this.args.dependencies.outreachSender &&
          finalState.outreachDraft?.autoSendAllowed
        ) {
          const sent = await this.args.dependencies.outreachSender.sendDraft({
            campaign,
            prospectState: finalState,
            logger: context.logger.child({ prospectId: prospect.prospectId, action: "auto_send" }),
          });

          finalState = ProspectRunStateSchema.parse({
            ...finalState,
            status: "completed",
            outreachDraft: {
              ...finalState.outreachDraft,
              status: "sent",
              reviewRequired: false,
              autoSendAllowed: true,
              provenance: finalState.outreachDraft.provenance,
            },
          });

          await this.args.repository.saveStageAttempt({
            attemptId: createAttemptId(),
            runId: run.runId,
            prospectId: prospect.prospectId,
            stage: "draft_outreach_email",
            status: "succeeded",
            attemptNumber: 1,
            idempotencyKey: createIdempotencyKey({
              campaignId: campaign.campaignId,
              scope: "auto-send",
              prospectId: prospect.prospectId,
              scheduleDate: run.scheduledFor.slice(0, 10),
            }),
            output: sent,
            startedAt: nowIso(),
            finishedAt: nowIso(),
          });
          await this.args.repository.saveProspectState(finalState);
        } else {
          finalState = ProspectRunStateSchema.parse({
            ...finalState,
            status: "awaiting_review",
          });
          await this.args.repository.saveProspectState(finalState);
        }

        finalProspects.push(finalState);
      } catch (error) {
        const failureState = ProspectRunStateSchema.parse({
          ...initialState,
          status: error instanceof StageBlockedError ? "blocked" : "failed",
          blockingReason: error instanceof Error ? error.message : String(error),
        });
        await this.args.repository.saveProspectState(failureState);
        finalProspects.push(failureState);
      }
    }

    return this.persistCampaignSummary(run, finalProspects);
  }
}
