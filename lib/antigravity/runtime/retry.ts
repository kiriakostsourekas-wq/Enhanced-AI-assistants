export type RetryPolicy = {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

type RetryArgs<T> = {
  taskName: string;
  retryPolicy: RetryPolicy;
  run: (attemptNumber: number) => Promise<T>;
  shouldRetry?: (error: unknown) => boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(baseDelayMs: number, maxDelayMs: number, attemptNumber: number) {
  const computed = baseDelayMs * 2 ** Math.max(0, attemptNumber - 1);
  return Math.min(maxDelayMs, computed);
}

export async function withRetry<T>({
  taskName,
  retryPolicy,
  run,
  shouldRetry = () => true,
}: RetryArgs<T>) {
  let lastError: unknown;

  for (let attemptNumber = 1; attemptNumber <= retryPolicy.attempts; attemptNumber += 1) {
    try {
      return await run(attemptNumber);
    } catch (error) {
      lastError = error;

      if (attemptNumber >= retryPolicy.attempts || !shouldRetry(error)) {
        break;
      }

      const delayMs = backoffDelay(retryPolicy.baseDelayMs, retryPolicy.maxDelayMs, attemptNumber);
      await sleep(delayMs);
    }
  }

  throw new Error(
    `${taskName} failed after ${retryPolicy.attempts} attempt(s): ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
