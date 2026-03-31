import { RunnableLambda } from "@langchain/core/runnables";
import type { z } from "zod";
import type { CampaignStage, ProspectStage, StageRuntimeContext } from "@/lib/antigravity/stages/interfaces";
import type { ProspectRunState } from "@/lib/antigravity/schemas";
import { ProspectRunStateSchema } from "@/lib/antigravity/schemas";
import { createAttemptId, createIdempotencyKey } from "@/lib/antigravity/runtime/idempotency";
import { StageBlockedError } from "@/lib/antigravity/runtime/errors";
import { withRetry } from "@/lib/antigravity/runtime/retry";

function stageAttemptKey(context: StageRuntimeContext, stageName: string, prospectId?: string) {
  return createIdempotencyKey({
    campaignId: context.campaign.campaignId,
    scope: stageName,
    prospectId,
    scheduleDate: context.run.scheduledFor.slice(0, 10),
  });
}

export async function runCampaignStage<OutputSchema extends z.ZodTypeAny>(
  stage: CampaignStage<OutputSchema>,
  context: StageRuntimeContext & Parameters<CampaignStage<OutputSchema>["execute"]>[0],
) {
  const stageLogger = context.logger.child({ stage: stage.name, runId: context.run.runId });
  const stageIdempotencyKey = stageAttemptKey(context, stage.name);

  stageLogger.info("stage_started", { idempotencyKey: stageIdempotencyKey });

  const output = await withRetry({
    taskName: stage.name,
    retryPolicy: stage.retryPolicy,
    run: () => stage.execute(context),
  });

  const parsedOutput = stage.outputSchema.parse(output);
  stageLogger.info("stage_succeeded", { idempotencyKey: stageIdempotencyKey });
  return parsedOutput;
}

export function createProspectStageRunnable<OutputSchema extends z.ZodTypeAny>(
  stage: ProspectStage<OutputSchema>,
  context: StageRuntimeContext & Parameters<ProspectStage<OutputSchema>["execute"]>[1],
) {
  return new RunnableLambda<ProspectRunState, ProspectRunState>({
    func: async (state: ProspectRunState) => {
      const parsedInput = stage.inputSchema.parse(state) as ProspectRunState;
      const attemptBase = {
        runId: context.run.runId,
        prospectId: parsedInput.prospect.prospectId,
        stage: stage.name,
        idempotencyKey: stageAttemptKey(context, stage.name, parsedInput.prospect.prospectId),
      };

      const stageLogger = context.logger.child({
        stage: stage.name,
        runId: context.run.runId,
        prospectId: parsedInput.prospect.prospectId,
      });

      stageLogger.info("stage_started", { idempotencyKey: attemptBase.idempotencyKey });

      try {
        const parsedOutput = await withRetry({
          taskName: `${stage.name}:${parsedInput.prospect.prospectId}`,
          retryPolicy: stage.retryPolicy,
          shouldRetry: (error) => !(error instanceof StageBlockedError),
          run: async (attemptNumber) => {
            const attemptId = createAttemptId();
            await context.repository.saveStageAttempt({
              attemptId,
              attemptNumber,
              startedAt: new Date().toISOString(),
              status: "running",
              ...attemptBase,
            });

            try {
              const output = await stage.execute(parsedInput, context);
              const safeOutput = stage.outputSchema.parse(output);
              await context.repository.saveStageAttempt({
                attemptId,
                attemptNumber,
                startedAt: new Date().toISOString(),
                finishedAt: new Date().toISOString(),
                status: "succeeded",
                input: parsedInput,
                output: safeOutput,
                ...attemptBase,
              });
              return safeOutput;
            } catch (error) {
              await context.repository.saveStageAttempt({
                attemptId,
                attemptNumber,
                startedAt: new Date().toISOString(),
                finishedAt: new Date().toISOString(),
                status: error instanceof StageBlockedError ? "blocked" : "failed",
                input: parsedInput,
                errorMessage: error instanceof Error ? error.message : String(error),
                ...attemptBase,
              });
              throw error;
            }
          },
        });

        const nextState = ProspectRunStateSchema.parse({
          ...stage.apply(parsedInput, parsedOutput),
          currentStage: stage.name,
          status: parsedInput.status === "queued" ? "running" : parsedInput.status,
        });

        await context.repository.saveProspectState(nextState);
        stageLogger.info("stage_succeeded", { idempotencyKey: attemptBase.idempotencyKey });
        return nextState;
      } catch (error) {
        const failedState = ProspectRunStateSchema.parse({
          ...parsedInput,
          currentStage: stage.name,
          status: error instanceof StageBlockedError ? "blocked" : "failed",
          blockingReason: error instanceof StageBlockedError ? error.message : parsedInput.blockingReason,
        });

        await context.repository.saveProspectState(failedState);
        stageLogger.error("stage_failed", {
          idempotencyKey: attemptBase.idempotencyKey,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  });
}
