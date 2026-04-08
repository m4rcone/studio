"use client";

import { useEffect, useState } from "react";
import type { StudioSession } from "@/lib/studio/types";
import { STUDIO_STRINGS } from "@/lib/studio/constants";
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

interface PreviewState extends PreviewStatus {
  sessionId: string;
}

export function SessionPanel({
  session,
  onApprove,
  onDiscard,
}: SessionPanelProps) {
  const s = STUDIO_STRINGS.session;
  const p = STUDIO_STRINGS.preview;
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    if (!session?.branch || !session?.id) {
      return;
    }
    let cancelled = false;

    async function fetchPreview() {
      try {
        const res = await fetch(`/api/studio/sessions/${session.id}/preview`);
        if (!res.ok || cancelled) return;

        const nextPreview = (await res.json()) as PreviewStatus;
        setPreview({ sessionId: session.id, ...nextPreview });
      } catch {
        // Ignore
      }
    }

    void fetchPreview();
    const interval = setInterval(() => {
      void fetchPreview();
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session?.branch, session?.id]);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-(--st-text-muted)">{s.noChanges}</p>
      </div>
    );
  }

  const activePreview = preview?.sessionId === session.id ? preview : null;
  const activeUrl = activePreview?.url;
  const estimatedUrl = activePreview?.estimatedUrl;

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
