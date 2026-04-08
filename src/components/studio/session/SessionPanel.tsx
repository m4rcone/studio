"use client";

import { useState, useEffect, useCallback } from "react";
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

export function SessionPanel({
  session,
  onApprove,
  onDiscard,
}: SessionPanelProps) {
  const s = STUDIO_STRINGS.session;
  const p = STUDIO_STRINGS.preview;
  const [preview, setPreview] = useState<PreviewStatus | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await fetch(`/api/studio/sessions/${session.id}/preview`);
      if (res.ok) setPreview(await res.json());
    } catch {
      // Ignore
    }
  }, [session?.id]);

  useEffect(() => {
    if (!session?.branch || !session?.id) {
      setPreview(null);
      return;
    }
    fetchPreview();
    const interval = setInterval(fetchPreview, 8000);
    return () => clearInterval(interval);
  }, [session?.branch, session?.id, fetchPreview]);

  async function handleCheckNow() {
    setIsChecking(true);
    await fetchPreview();
    setIsChecking(false);
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-(--st-text-muted)">{s.noChanges}</p>
      </div>
    );
  }

  const activeUrl = preview?.url;
  const estimatedUrl = preview?.estimatedUrl;

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
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {activeUrl ? (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="st-focus-ring text-xs text-(--st-accent) underline underline-offset-4 hover:text-(--st-accent-hover)"
              >
                {showPreview ? p.hidePreview : p.showPreview}
              </button>
            ) : (
              <>
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
              </>
            )}
            <a
              href={activeUrl ?? estimatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="st-focus-ring text-xs text-(--st-text-muted) underline underline-offset-4 hover:text-(--st-text)"
            >
              {p.openNewTab}
            </a>
          </div>
        )}
      </div>

      {/* Preview iframe — only when deployment URL is confirmed ready */}
      {showPreview && activeUrl && (
        <div className="min-h-75 flex-1">
          <PreviewFrame url={activeUrl} estimatedUrl={estimatedUrl ?? null} />
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
