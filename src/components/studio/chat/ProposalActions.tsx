"use client";

import { StudioButton } from "../ui/StudioButton";
import type { ProposalUiState } from "@/hooks/studio/useChat";

interface ProposalActionsProps {
  proposalState: ProposalUiState;
  disabled?: boolean;
  onApply: () => unknown | Promise<unknown>;
  onDeny: () => unknown | Promise<unknown>;
}

export function ProposalActions({
  proposalState,
  disabled = false,
  onApply,
  onDeny,
}: ProposalActionsProps) {
  if (proposalState === "applied") {
    return (
      <div className="flex flex-col items-start gap-2" aria-live="polite">
        <span className="inline-flex items-center gap-2 rounded-(--st-radius-full) bg-(--st-success-muted) px-3 py-1.5 text-xs font-medium text-(--st-success)">
          <svg
            aria-hidden="true"
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
          Applied
        </span>
        <p className="text-xs leading-relaxed text-(--st-text-muted)">
          Preview is being generated or updated. It may take a minute.
        </p>
      </div>
    );
  }

  if (proposalState === "rejected") {
    return (
      <div className="flex flex-col items-start gap-2" aria-live="polite">
        <span className="inline-flex items-center gap-2 rounded-(--st-radius-full) bg-(--st-danger-muted) px-3 py-1.5 text-xs font-medium text-(--st-danger)">
          Denied
        </span>
      </div>
    );
  }

  if (proposalState === "superseded") {
    return (
      <div className="flex flex-col items-start gap-2" aria-live="polite">
        <span className="inline-flex items-center gap-2 rounded-(--st-radius-full) bg-(--st-warning-muted) px-3 py-1.5 text-xs font-medium text-(--st-warning)">
          Superseded
        </span>
        <p className="text-xs leading-relaxed text-(--st-text-muted)">
          A newer request replaced this suggestion.
        </p>
      </div>
    );
  }

  const isApplying = proposalState === "applying";
  const isRejecting = proposalState === "rejecting";
  const actionsDisabled = disabled || isApplying || isRejecting;

  return (
    <div className="flex flex-col items-start gap-2" aria-live="polite">
      <div className="flex flex-wrap gap-2">
        <StudioButton
          variant="secondary"
          size="sm"
          loading={isApplying}
          disabled={actionsDisabled}
          onClick={() => void onApply()}
        >
          {isApplying ? "Applying…" : "Apply"}
        </StudioButton>

        <StudioButton
          variant="ghost"
          size="sm"
          loading={isRejecting}
          disabled={actionsDisabled}
          onClick={() => void onDeny()}
        >
          {isRejecting ? "Denying…" : "Deny"}
        </StudioButton>
      </div>
    </div>
  );
}
