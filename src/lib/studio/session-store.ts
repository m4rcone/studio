import { getRedis, sessionKey, messagesKey, userSessionsKey } from "./store";
import type { StudioSession, ChatMessage } from "./types";

const SESSION_TTL = 86400; // 24h
const MESSAGES_TTL = 86400; // 24h

/**
 * Create a new studio session.
 */
export async function createSession(
  userId: string,
  role: "client" | "team",
): Promise<StudioSession> {
  const redis = getRedis();

  const session: StudioSession = {
    id: crypto.randomUUID(),
    userId,
    role,
    status: "active",
    branch: null,
    prNumber: null,
    prUrl: null,
    previewUrl: null,
    latestCommitSha: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: "",
    changedFiles: [],
    commitCount: 0,
  };

  await redis.set(sessionKey(session.id), JSON.stringify(session), {
    ex: SESSION_TTL,
  });
  await redis.sadd(userSessionsKey(userId), session.id);

  return session;
}

/**
 * Get a session by ID.
 */
export async function getSession(
  sessionId: string,
): Promise<StudioSession | null> {
  const redis = getRedis();
  const data = await redis.get(sessionKey(sessionId));
  if (!data) return null;
  const session =
    typeof data === "string" ? JSON.parse(data) : (data as StudioSession);
  return {
    ...session,
    latestCommitSha: session.latestCommitSha ?? null,
  };
}

/**
 * Update a session in Redis.
 */
export async function updateSession(session: StudioSession): Promise<void> {
  const redis = getRedis();
  session.updatedAt = new Date().toISOString();
  await redis.set(sessionKey(session.id), JSON.stringify(session), {
    ex: SESSION_TTL,
  });
}

/**
 * List session IDs for a user.
 */
export async function getUserSessionIds(userId: string): Promise<string[]> {
  const redis = getRedis();
  const ids = await redis.smembers(userSessionsKey(userId));
  return ids;
}

/**
 * Get chat messages for a session.
 */
export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const redis = getRedis();
  const data = await redis.get(messagesKey(sessionId));
  if (!data) return [];
  return typeof data === "string" ? JSON.parse(data) : (data as ChatMessage[]);
}

/**
 * Append a message to the session's chat history.
 */
export async function appendMessage(
  sessionId: string,
  message: ChatMessage,
): Promise<void> {
  const redis = getRedis();
  const messages = await getMessages(sessionId);
  messages.push(message);
  await redis.set(messagesKey(sessionId), JSON.stringify(messages), {
    ex: MESSAGES_TTL,
  });
}

/**
 * Delete a session and its associated data.
 */
export async function deleteSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  const redis = getRedis();
  await redis.del(sessionKey(sessionId), messagesKey(sessionId));
  await redis.srem(userSessionsKey(userId), sessionId);
}
