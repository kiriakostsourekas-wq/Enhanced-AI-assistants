import { Pool } from "pg";
import type {
  CampaignRunRecord,
  ProspectRunState,
  StageAttemptRecord,
} from "@/lib/antigravity/schemas";
import {
  CampaignRunRowSchema,
  mapCampaignRunRow,
  mapProspectRunRow,
  ProspectRunRowSchema,
} from "@/lib/antigravity/persistence/models";
import type { AntigravityRepository } from "@/lib/antigravity/persistence/repository";

type PostgresRepositoryArgs = {
  connectionString: string;
};

export class PostgresAntigravityRepository implements AntigravityRepository {
  private readonly pool: Pool;

  constructor({ connectionString }: PostgresRepositoryArgs) {
    this.pool = new Pool({ connectionString });
  }

  async findCampaignRunByIdempotencyKey(idempotencyKey: string) {
    const result = await this.pool.query(
      `
        select *
        from antigravity_campaign_runs
        where idempotency_key = $1
        limit 1
      `,
      [idempotencyKey],
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapCampaignRunRow(CampaignRunRowSchema.parse(result.rows[0]));
  }

  async saveCampaignRun(run: CampaignRunRecord) {
    await this.pool.query(
      `
        insert into antigravity_campaign_runs (
          run_id,
          campaign_id,
          idempotency_key,
          status,
          current_stage,
          scheduled_for,
          started_at,
          completed_at,
          config_json,
          summary_json
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
        on conflict (run_id) do update set
          status = excluded.status,
          current_stage = excluded.current_stage,
          completed_at = excluded.completed_at,
          config_json = excluded.config_json,
          summary_json = excluded.summary_json
      `,
      [
        run.runId,
        run.campaignId,
        run.idempotencyKey,
        run.status,
        run.currentStage ?? null,
        run.scheduledFor,
        run.startedAt,
        run.completedAt ?? null,
        JSON.stringify(run.config),
        JSON.stringify(run.summary),
      ],
    );
  }

  async saveProspectState(state: ProspectRunState) {
    await this.pool.query(
      `
        insert into antigravity_prospect_runs (
          run_id,
          campaign_id,
          prospect_id,
          status,
          current_stage,
          blocking_reason,
          state_json
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb)
        on conflict (run_id, prospect_id) do update set
          status = excluded.status,
          current_stage = excluded.current_stage,
          blocking_reason = excluded.blocking_reason,
          state_json = excluded.state_json
      `,
      [
        state.runId,
        state.campaignId,
        state.prospect.prospectId,
        state.status,
        state.currentStage ?? null,
        state.blockingReason ?? null,
        JSON.stringify(state),
      ],
    );
  }

  async saveStageAttempt(attempt: StageAttemptRecord) {
    await this.pool.query(
      `
        insert into antigravity_stage_attempts (
          attempt_id,
          run_id,
          prospect_id,
          stage_name,
          status,
          attempt_number,
          idempotency_key,
          input_json,
          output_json,
          error_message,
          started_at,
          finished_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12)
        on conflict (attempt_id) do update set
          status = excluded.status,
          output_json = excluded.output_json,
          error_message = excluded.error_message,
          finished_at = excluded.finished_at
      `,
      [
        attempt.attemptId,
        attempt.runId,
        attempt.prospectId ?? null,
        attempt.stage,
        attempt.status,
        attempt.attemptNumber,
        attempt.idempotencyKey,
        JSON.stringify(attempt.input ?? null),
        JSON.stringify(attempt.output ?? null),
        attempt.errorMessage ?? null,
        attempt.startedAt,
        attempt.finishedAt ?? null,
      ],
    );
  }

  async listProspectsForRun(runId: string) {
    const result = await this.pool.query(
      `
        select *
        from antigravity_prospect_runs
        where run_id = $1
        order by prospect_id asc
      `,
      [runId],
    );

    return result.rows.map((row: unknown) => mapProspectRunRow(ProspectRunRowSchema.parse(row)));
  }
}
