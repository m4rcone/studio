"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StudioSession } from "@/lib/studio/types";
import { STUDIO_STRINGS } from "@/lib/studio/constants";
import { PreviewFrame } from "./PreviewFrame";
import { StudioButton } from "../ui/StudioButton";

interface SessionPanelProps {
  session: StudioSession | null;
  onApprove: () => void;
  onDiscard: () => void;
}

interface PreviewStatus {
  status: string;
  url: string | null;
  estimatedUrl: string | null;
}

/**
 * Client-side deployment probe using an <img> element pointing to /favicon.ico.
 * Works without CORS and without server-side caching issues.
 * Returns true when the deployment is serving content (favicon loads = site is up).
 */
function probeDeployment(baseUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(false);
    }, 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    // Cache-bust to avoid browser caching a previous 404
    img.src = `${baseUrl}/favicon.ico?_=${Date.now()}`;
  });
}

export function SessionPanel({
  session,
  onApprove,
  onDiscard,
}: SessionPanelProps) {
  const s = STUDIO_STRINGS.session;
  const p = STUDIO_STRINGS.preview;

  // estimatedUrl comes from the server (computed from branch name + env vars)
  const [estimatedUrl, setEstimatedUrl] = useState<string | null>(null);
  // confirmedUrl is set once the client-side probe succeeds
  const [confirmedUrl, setConfirmedUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const probeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch estimated URL from server (no longer trying to confirm server-side)
  const fetchEstimatedUrl = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await fetch(`/api/studio/sessions/${session.id}/preview`);
      if (!res.ok) return;
      const data: PreviewStatus = await res.json();
      // Accept server-confirmed url immediately
      if (data.url) {
        setConfirmedUrl(data.url);
      }
      if (data.estimatedUrl) {
        setEstimatedUrl(data.estimatedUrl);
      }
    } catch {
      // Ignore
    }
  }, [session?.id]);

  // Start client-side probe loop once we have an estimatedUrl
  const runProbe = useCallback(async () => {
    if (!estimatedUrl || confirmedUrl) return;
    const live = await probeDeployment(estimatedUrl);
    if (live) {
      setConfirmedUrl(estimatedUrl);
      if (probeIntervalRef.current) {
        clearInterval(probeIntervalRef.current);
        probeIntervalRef.current = null;
      }
    }
  }, [estimatedUrl, confirmedUrl]);

  // Fetch estimatedUrl from server when branch is created
  useEffect(() => {
    if (!session?.branch || !session?.id) {
      setEstimatedUrl(null);
      setConfirmedUrl(null);
      return;
    }
    fetchEstimatedUrl();
  }, [session?.branch, session?.id, fetchEstimatedUrl]);

  // Start / restart probe interval when estimatedUrl becomes available
  useEffect(() => {
    if (!estimatedUrl || confirmedUrl) {
      if (probeIntervalRef.current) {
        clearInterval(probeIntervalRef.current);
        probeIntervalRef.current = null;
      }
      return;
    }
    // Run immediately, then every 8 seconds
    runProbe();
    probeIntervalRef.current = setInterval(runProbe, 8000);
    return () => {
      if (probeIntervalRef.current) {
        clearInterval(probeIntervalRef.current);
        probeIntervalRef.current = null;
      }
    };
  }, [estimatedUrl, confirmedUrl, runProbe]);

  async function handleCheckNow() {
    if (!estimatedUrl) return;
    setIsChecking(true);
    const live = await probeDeployment(estimatedUrl);
    if (live) setConfirmedUrl(estimatedUrl);
    setIsChecking(false);
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-(--st-text-muted)">{s.noChanges}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Info section */}
      <div className="border-b border-(--st-border) p-5">
        <h2 className="mb-1 text-sm font-semibold text-(--st-text)">
          {session.title || s.statusActive}
        </h2>

        {/* Changed files */}
        {session.changedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-medium tracking-wider text-(--st-text-muted) uppercase">
              {s.changesLabel}
            </h3>
            <ul className="space-y-1" role="list">
              {session.changedFiles.map((file) => (
                <li
                  key={file}
                  className="font-(family-name:--st-font-mono) text-xs text-(--st-text-secondary)"
                >
                  {file}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview controls */}
        {estimatedUrl && (
          <div className="mt-4 space-y-2">
            {confirmedUrl ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="st-focus-ring text-xs text-(--st-accent) underline underline-offset-4 hover:text-(--st-accent-hover)"
                >
                  {showPreview ? p.hidePreview : p.showPreview}
                </button>
                <a
                  href={confirmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-focus-ring text-xs text-(--st-text-muted) underline underline-offset-4 hover:text-(--st-text)"
                >
                  {p.openNewTab}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-(--st-text-muted)">
                  {isChecking ? p.checking : p.estimatedWarning}
                </span>
                <button
                  onClick={handleCheckNow}
                  disabled={isChecking}
                  className="st-focus-ring text-xs text-(--st-accent) underline underline-offset-4 hover:text-(--st-accent-hover) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {p.checkNow}
                </button>
                {/* Always allow opening in new tab even while building */}
                <a
                  href={estimatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="st-focus-ring text-xs text-(--st-text-muted) underline underline-offset-4 hover:text-(--st-text)"
                >
                  {p.openNewTab}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview iframe — only when deployment is confirmed ready */}
      {showPreview && confirmedUrl && (
        <div className="min-h-75 flex-1">
          <PreviewFrame url={confirmedUrl} estimatedUrl={estimatedUrl} />
        </div>
      )}

      {/* Actions */}
      {session.status === "active" && session.prNumber && (
        <div className="mt-auto border-t border-(--st-border) p-5">
          <div className="flex gap-2.5">
            <StudioButton
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onApprove}
            >
              {s.publishButton}
            </StudioButton>
            <StudioButton
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onDiscard}
            >
              {s.discardButton}
            </StudioButton>
          </div>
        </div>
      )}
    </div>
  );
}
