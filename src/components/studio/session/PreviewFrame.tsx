"use client";

import { useState, useCallback } from "react";
import { STUDIO_STRINGS } from "@/lib/studio/constants";
import { StudioButton } from "../ui/StudioButton";

interface PreviewFrameProps {
  url: string | null;
  estimatedUrl: string | null;
}

export function PreviewFrame({ url, estimatedUrl }: PreviewFrameProps) {
  const [iframeFailed, setIframeFailed] = useState(false);
  const previewUrl = url || estimatedUrl;
  const s = STUDIO_STRINGS.preview;

  const handleError = useCallback(() => {
    setIframeFailed(true);
  }, []);

  if (!previewUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-(--st-bg-surface)">
        <p className="text-sm text-(--st-text-muted)">{s.unavailable}</p>
      </div>
    );
  }

  if (iframeFailed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-(--st-bg-surface) p-6">
        <p className="text-center text-sm text-(--st-text-secondary)">
          {s.iframeFailed}
        </p>
        <StudioButton
          variant="secondary"
          size="sm"
          onClick={() => window.open(previewUrl, "_blank")}
        >
          {s.openNewTab}
        </StudioButton>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <iframe
        src={previewUrl}
        title="Site preview"
        className="h-full w-full border-0"
        onError={handleError}
        sandbox="allow-scripts allow-same-origin"
      />
      {!url && estimatedUrl && (
        <div className="absolute right-0 bottom-0 left-0 bg-(--st-warning-muted) px-3 py-1.5 text-center text-xs text-(--st-warning)">
          {s.estimatedWarning}
        </div>
      )}
    </div>
  );
}
