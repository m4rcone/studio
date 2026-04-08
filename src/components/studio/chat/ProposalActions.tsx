"use client";

import { useState } from "react";
import { STUDIO_STRINGS } from "@/lib/studio/constants";
import { StudioButton } from "../ui/StudioButton";

interface ProposalActionsProps {
  sessionId: string;
  proposalId: string;
  onApplied?: () => void;
}

export function ProposalActions({
  sessionId,
  proposalId,
  onApplied,
}: ProposalActionsProps) {
  const [status, setStatus] = useState<
    "idle" | "applying" | "applied" | "error"
  >("idle");
  const s = STUDIO_STRINGS.chat;

  async function handleApply() {
    setStatus("applying");
    try {
      const res = await fetch(
        `/api/studio/sessions/${sessionId}/proposals/${proposalId}/apply`,
        { method: "POST" },
      );
      if (res.ok) {
        setStatus("applied");
        onApplied?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "applied") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-(--st-success)">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.appliedLabel}
      </span>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-(--st-danger)" role="alert">
          {s.applyError}
        </span>
        <StudioButton variant="secondary" size="sm" onClick={handleApply}>
          {s.applyButton}
        </StudioButton>
      </div>
    );
  }

  return (
    <StudioButton
      variant="secondary"
      size="sm"
      loading={status === "applying"}
      onClick={handleApply}
    >
      {s.applyButton}
    </StudioButton>
  );
}
