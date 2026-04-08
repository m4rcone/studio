import { Redis } from "@upstash/redis";
import { getEnv } from "./env";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;
  const env = getEnv();
  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

const KEY_PREFIX = "studio";

export function sessionKey(sessionId: string) {
  return `${KEY_PREFIX}:session:${sessionId}`;
}

export function messagesKey(sessionId: string) {
  return `${KEY_PREFIX}:session:${sessionId}:messages`;
}

export function proposalKey(sessionId: string) {
  return `${KEY_PREFIX}:session:${sessionId}:proposal`;
}

export function lockKey(sessionId: string) {
  return `${KEY_PREFIX}:session:${sessionId}:lock`;
}

export function userSessionsKey(userId: string) {
  return `${KEY_PREFIX}:user:${userId}:sessions`;
}

/**
 * Acquire a distributed lock for a session.
 * Returns true if acquired, false if already locked.
 */
export async function acquireLock(sessionId: string): Promise<boolean> {
  const r = getRedis();
  const result = await r.set(lockKey(sessionId), "1", { nx: true, ex: 30 });
  return result === "OK";
}

/**
 * Release a session lock.
 */
export async function releaseLock(sessionId: string): Promise<void> {
  const r = getRedis();
  await r.del(lockKey(sessionId));
}
