import { z } from "zod";

const AntigravityEnvSchema = z.object({
  ANTIGRAVITY_DATABASE_URL: z.string().trim().min(1).optional(),
  ANTIGRAVITY_PREVIEW_BASE_URL: z.string().trim().min(1).default("http://127.0.0.1:3000"),
});

export function getAntigravityEnv() {
  return AntigravityEnvSchema.parse({
    ANTIGRAVITY_DATABASE_URL: process.env.ANTIGRAVITY_DATABASE_URL,
    ANTIGRAVITY_PREVIEW_BASE_URL: process.env.ANTIGRAVITY_PREVIEW_BASE_URL,
  });
}
