import type {
  CampaignRunRecord,
  ProspectRunState,
  StageAttemptRecord,
} from "@/lib/antigravity/schemas";

export interface AntigravityRepository {
  findCampaignRunByIdempotencyKey(idempotencyKey: string): Promise<CampaignRunRecord | null>;
  saveCampaignRun(run: CampaignRunRecord): Promise<void>;
  saveProspectState(state: ProspectRunState): Promise<void>;
  saveStageAttempt(attempt: StageAttemptRecord): Promise<void>;
  listProspectsForRun(runId: string): Promise<ProspectRunState[]>;
}
