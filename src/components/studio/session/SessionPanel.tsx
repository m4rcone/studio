"use client";

import { useState, useEffect } from "react";
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
  const [preview, setPreview] = useState<PreviewStatus | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!session?.branch || !session?.id) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    async function fetchPreview() {
      try {
        const res = await fetch(`/api/studio/sessions/${session!.id}/preview`);
        if (res.ok && !cancelled) {
          setPreview(await res.json());
        }
      } catch {
        // Ignore
      }
    }

    fetchPreview();
    const interval = setInterval(fetchPreview, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.branch, session?.id]);

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

        {/* Preview toggle */}
        {preview && (
          <div className="mt-4 flex items-center gap-3">
            {preview.url ? (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="st-focus-ring text-xs text-(--st-accent) underline underline-offset-4 hover:text-(--st-accent-hover)"
              >
                {showPreview
                  ? STUDIO_STRINGS.preview.hidePreview
                  : STUDIO_STRINGS.preview.showPreview}
              </button>
            ) : (
              <span className="text-xs text-(--st-text-muted)">
                {STUDIO_STRINGS.preview.estimatedWarning}
              </span>
            )}
            {preview.url && (
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="st-focus-ring text-xs text-(--st-text-muted) underline underline-offset-4 hover:text-(--st-text)"
              >
                {STUDIO_STRINGS.preview.openNewTab}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Preview iframe — only when deployment URL is confirmed ready */}
      {showPreview && preview?.url && (
        <div className="min-h-75 flex-1">
          <PreviewFrame url={preview.url} estimatedUrl={preview.estimatedUrl} />
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
