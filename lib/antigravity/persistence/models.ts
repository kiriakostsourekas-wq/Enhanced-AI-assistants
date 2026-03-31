import { z } from "zod";
import {
  CampaignRunRecordSchema,
  ProspectRunStateSchema,
  StageAttemptRecordSchema,
} from "@/lib/antigravity/schemas";

export const CampaignRunRowSchema = z.object({
  run_id: z.string().uuid(),
  campaign_id: z.string().min(1),
  idempotency_key: z.string().min(1),
  status: z.string().min(1),
  current_stage: z.string().optional().nullable(),
  scheduled_for: z.string().datetime(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional().nullable(),
  config_json: z.unknown(),
  summary_json: z.unknown().optional().nullable(),
});

export const ProspectRunRowSchema = z.object({
  run_id: z.string().uuid(),
  campaign_id: z.string().min(1),
  prospect_id: z.string().min(1),
  status: z.string().min(1),
  current_stage: z.string().optional().nullable(),
  blocking_reason: z.string().optional().nullable(),
  state_json: z.unknown(),
});

export const StageAttemptRowSchema = z.object({
  attempt_id: z.string().uuid(),
  run_id: z.string().uuid(),
  prospect_id: z.string().optional().nullable(),
  stage_name: z.string().min(1),
  status: z.string().min(1),
  attempt_number: z.number().int().positive(),
  idempotency_key: z.string().min(1),
  input_json: z.unknown().optional().nullable(),
  output_json: z.unknown().optional().nullable(),
  error_message: z.string().optional().nullable(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().optional().nullable(),
});

export function mapCampaignRunRow(row: z.infer<typeof CampaignRunRowSchema>) {
  return CampaignRunRecordSchema.parse({
    runId: row.run_id,
    campaignId: row.campaign_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    currentStage: row.current_stage ?? undefined,
    scheduledFor: row.scheduled_for,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    config: row.config_json,
    summary: row.summary_json ?? {},
  });
}

export function mapProspectRunRow(row: z.infer<typeof ProspectRunRowSchema>) {
  return ProspectRunStateSchema.parse({
    ...(row.state_json as Record<string, unknown>),
    runId: row.run_id,
    campaignId: row.campaign_id,
    status: row.status,
    currentStage: row.current_stage ?? undefined,
    blockingReason: row.blocking_reason ?? undefined,
  });
}

export function mapStageAttemptRow(row: z.infer<typeof StageAttemptRowSchema>) {
  return StageAttemptRecordSchema.parse({
    attemptId: row.attempt_id,
    runId: row.run_id,
    prospectId: row.prospect_id ?? undefined,
    stage: row.stage_name,
    status: row.status,
    attemptNumber: row.attempt_number,
    idempotencyKey: row.idempotency_key,
    input: row.input_json ?? undefined,
    output: row.output_json ?? undefined,
    errorMessage: row.error_message ?? undefined,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
  });
}
