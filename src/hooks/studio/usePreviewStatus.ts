"use client";

import type { StudioSession } from "@/lib/studio/types";

export function usePreviewStatus(session: StudioSession | null) {
  return {
    bypassConfigured: false,
    previewHref: session?.previewUrl ?? null,
  };
}
