import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_OWNER: z.string().min(1),
  GITHUB_REPO: z.string().min(1),
  GITHUB_DEFAULT_BRANCH: z.string().default("main"),
  ANTHROPIC_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  STUDIO_USERS: z.string().min(1),
  STUDIO_PASSWORD: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  VERCEL_PROJECT_NAME: z.string().optional(),
  VERCEL_TEAM_SLUG: z.string().optional(),
  VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
});

export type StudioEnv = z.infer<typeof envSchema>;

let cached: StudioEnv | null = null;

/**
 * Lazy env validation — validates on first call, caches result.
 * Does NOT run at import time (would break CI/build where env vars aren't set).
 */
export function getEnv(): StudioEnv {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}
