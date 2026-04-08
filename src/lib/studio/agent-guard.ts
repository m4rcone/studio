export const AGENT_LIMITS = {
  maxToolIterations: 10,
  maxElapsedMs: 60_000,
  maxTokensPerTurn: 4096,
} as const;

export function checkLimits(
  iterations: number,
  startTime: number,
  signal: AbortSignal,
): { ok: true } | { ok: false; reason: string } {
  if (signal.aborted) {
    return { ok: false, reason: "Request cancelled" };
  }
  if (iterations >= AGENT_LIMITS.maxToolIterations) {
    return { ok: false, reason: "Too many tool calls" };
  }
  if (Date.now() - startTime > AGENT_LIMITS.maxElapsedMs) {
    return { ok: false, reason: "Request timeout" };
  }
  return { ok: true };
}
