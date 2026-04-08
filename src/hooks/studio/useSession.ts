"use client";

import { useState, useCallback } from "react";
import type { StudioSession } from "@/lib/studio/types";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

export function useSession() {
  const [session, setSession] = useState<StudioSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/sessions", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.detail || body.error || STUDIO_STRINGS.errors.generic;
        setError(msg);
        return null;
      }
      const data = await res.json();
      setSession(data);
      return data as StudioSession;
    } catch {
      setError(STUDIO_STRINGS.errors.network);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/studio/sessions/${sessionId}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data);
    }
  }, []);

  const approveSession = useCallback(async () => {
    if (!session) return;
    const res = await fetch(`/api/studio/sessions/${session.id}/approve`, {
      method: "POST",
    });
    if (res.ok) {
      setSession((prev) => (prev ? { ...prev, status: "approved" } : null));
    }
  }, [session]);

  const discardSession = useCallback(async () => {
    if (!session) return;
    const res = await fetch(`/api/studio/sessions/${session.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSession((prev) => (prev ? { ...prev, status: "discarded" } : null));
    }
  }, [session]);

  return {
    session,
    loading,
    error,
    setSession,
    createSession,
    refreshSession,
    approveSession,
    discardSession,
  };
}
