"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioSession } from "@/lib/studio/types";

interface PreviewStatus {
  status: string;
  url: string | null;
  estimatedUrl: string | null;
  bypassConfigured?: boolean;
}

interface PreviewState extends PreviewStatus {
  sessionId: string;
}

export function usePreviewStatus(session: StudioSession | null) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const sessionId = session?.id ?? null;
  const branch = session?.branch ?? null;
  const activePreview = preview?.sessionId === sessionId ? preview : null;
  const previewHref =
    activePreview?.url ??
    activePreview?.estimatedUrl ??
    session?.previewUrl ??
    null;
  const previewPending = Boolean(
    sessionId &&
    (refreshToken > 0 ||
      activePreview?.status === "building" ||
      activePreview?.status === "no_branch"),
  );
  const previewStatus = !sessionId
    ? "idle"
    : previewPending && activePreview?.status !== "error"
      ? "building"
      : (activePreview?.status ?? (branch ? "building" : "idle"));

  const markPreviewPending = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!sessionId || !isDocumentVisible) {
      return;
    }

    const currentSessionId = sessionId;
    const shouldFetch = Boolean(branch || refreshToken > 0 || activePreview);

    if (!shouldFetch) {
      return;
    }

    let cancelled = false;

    async function fetchPreview() {
      try {
        const res = await fetch(
          `/api/studio/sessions/${currentSessionId}/preview`,
          {
            cache: "no-store",
          },
        );

        if (cancelled || !res.ok) {
          return;
        }

        const nextPreview = (await res.json()) as PreviewStatus;
        if (cancelled) return;

        setPreview({ sessionId: currentSessionId, ...nextPreview });

        if (nextPreview.status === "ready" || nextPreview.status === "error") {
          setRefreshToken(0);
        }
      } catch {
        // Ignore transient preview polling failures
      }
    }

    void fetchPreview();

    if (!previewPending) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(() => {
      void fetchPreview();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    activePreview,
    branch,
    isDocumentVisible,
    previewPending,
    refreshToken,
    sessionId,
  ]);

  return {
    bypassConfigured: activePreview?.bypassConfigured ?? false,
    previewHref,
    previewPending,
    previewStatus,
    markPreviewPending,
  };
}
