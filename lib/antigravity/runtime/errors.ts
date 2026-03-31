export class StageBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StageBlockedError";
  }
}

export class IdempotencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}
