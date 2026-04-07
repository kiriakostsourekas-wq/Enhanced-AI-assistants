import { z } from "zod";

const OptionalEnvStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().trim().min(1).optional());

const AntigravityEnvSchema = z.object({
  ANTIGRAVITY_DATABASE_URL: OptionalEnvStringSchema,
  DATABASE_URL: OptionalEnvStringSchema,
  ANTIGRAVITY_PREVIEW_BASE_URL: z.string().trim().min(1).default("http://127.0.0.1:3000"),
});

function resolveDatabaseUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  if (/^postgres(ql)?:\/\//i.test(value)) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    throw new Error(
      "ANTIGRAVITY_DATABASE_URL must be a Postgres connection string. The current value looks like a Supabase project URL, not the Supabase Postgres database URL.",
    );
  }

  throw new Error("ANTIGRAVITY_DATABASE_URL must start with postgres:// or postgresql://.");
}

export function getAntigravityEnv() {
  const env = AntigravityEnvSchema.parse({
    ANTIGRAVITY_DATABASE_URL: process.env.ANTIGRAVITY_DATABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    ANTIGRAVITY_PREVIEW_BASE_URL: process.env.ANTIGRAVITY_PREVIEW_BASE_URL,
  });

  return {
    ANTIGRAVITY_DATABASE_URL: resolveDatabaseUrl(env.ANTIGRAVITY_DATABASE_URL ?? env.DATABASE_URL),
    ANTIGRAVITY_PREVIEW_BASE_URL: env.ANTIGRAVITY_PREVIEW_BASE_URL,
  };
}
