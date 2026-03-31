import { createHash, randomUUID } from "node:crypto";

type IdempotencyArgs = {
  campaignId: string;
  scope: string;
  prospectId?: string;
  scheduleDate: string;
};

export function createIdempotencyKey({
  campaignId,
  scope,
  prospectId,
  scheduleDate,
}: IdempotencyArgs) {
  return createHash("sha256")
    .update([campaignId, scope, prospectId ?? "", scheduleDate].join("::"))
    .digest("hex");
}

export function createRunId() {
  return randomUUID();
}

export function createAttemptId() {
  return randomUUID();
}
