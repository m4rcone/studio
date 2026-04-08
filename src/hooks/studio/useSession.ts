"use client";

import { useState, useCallback } from "react";
import type { StudioSession } from "@/lib/studio/types";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

const SESSION_STORAGE_KEY = "studio_session_id";

function getSavedSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

function saveSessionId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
}

function clearSavedSessionId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

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
      saveSessionId(data.id);
      setSession(data);
      return data as StudioSession;
    } catch {
      setError(STUDIO_STRINGS.errors.network);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Try to restore a previously active session from localStorage.
   * Falls back to creating a new session if the saved one is gone or terminal.
   */
  const restoreOrCreateSession = useCallback(async () => {
    const savedId = getSavedSessionId();
    if (savedId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/studio/sessions/${savedId}`);
        if (res.ok) {
          const data: StudioSession = await res.json();
          if (data.status === "active") {
            setSession(data);
            setLoading(false);
            return data;
          }
        }
      } catch {
        // Fall through to create a new session
      } finally {
        setLoading(false);
      }
      clearSavedSessionId();
    }
    return createSession();
  }, [createSession]);

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
      clearSavedSessionId();
      setSession((prev) => (prev ? { ...prev, status: "approved" } : null));
    }
  }, [session]);

  const discardSession = useCallback(async () => {
    if (!session) return;
    const res = await fetch(`/api/studio/sessions/${session.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      clearSavedSessionId();
      setSession((prev) => (prev ? { ...prev, status: "discarded" } : null));
    }
  }, [session]);

  /**
   * Start a fresh session without discarding the current PR on GitHub.
   * Returns the sessionId that was cleared (so caller can clear its chat history).
   */
  const startNewSession = useCallback(async (): Promise<string | null> => {
    const oldId = session?.id ?? null;
    clearSavedSessionId();
    setSession(null);
    await createSession();
    return oldId;
  }, [session, createSession]);

  return {
    session,
    loading,
    error,
    setSession,
    createSession,
    restoreOrCreateSession,
    refreshSession,
    approveSession,
    discardSession,
    startNewSession,
  };
}
