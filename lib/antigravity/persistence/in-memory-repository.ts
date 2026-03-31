import type {
  CampaignRunRecord,
  ProspectRunState,
  StageAttemptRecord,
} from "@/lib/antigravity/schemas";
import type { AntigravityRepository } from "@/lib/antigravity/persistence/repository";

export class InMemoryAntigravityRepository implements AntigravityRepository {
  private readonly campaignRuns = new Map<string, CampaignRunRecord>();
  private readonly prospectRuns = new Map<string, ProspectRunState>();
  private readonly stageAttempts = new Map<string, StageAttemptRecord>();

  async findCampaignRunByIdempotencyKey(idempotencyKey: string) {
    for (const run of this.campaignRuns.values()) {
      if (run.idempotencyKey === idempotencyKey) {
        return run;
      }
    }

    return null;
  }

  async saveCampaignRun(run: CampaignRunRecord) {
    this.campaignRuns.set(run.runId, run);
  }

  async saveProspectState(state: ProspectRunState) {
    this.prospectRuns.set(`${state.runId}:${state.prospect.prospectId}`, state);
  }

  async saveStageAttempt(attempt: StageAttemptRecord) {
    this.stageAttempts.set(attempt.attemptId, attempt);
  }

  async listProspectsForRun(runId: string) {
    return [...this.prospectRuns.values()].filter((state) => state.runId === runId);
  }
}
