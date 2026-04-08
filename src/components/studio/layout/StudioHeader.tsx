"use client";

import { STUDIO_STRINGS } from "@/lib/studio/constants";
import { StudioBadge } from "../ui/StudioBadge";
import { StudioButton } from "../ui/StudioButton";

interface StudioHeaderProps {
  userName: string | null;
  sessionStatus?: string;
  statusVariant?: "active" | "approved" | "discarded";
  onLogout: () => void;
}

export function StudioHeader({
  userName,
  sessionStatus,
  statusVariant = "active",
  onLogout,
}: StudioHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-(--st-border) bg-(--st-bg-elevated) px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--st-accent)"
          >
            <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272z" />
          </svg>
          <span className="text-sm font-semibold text-(--st-text)">Studio</span>
        </div>
        {sessionStatus && (
          <StudioBadge label={sessionStatus} variant={statusVariant} />
        )}
      </div>

      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-xs text-(--st-text-muted)">{userName}</span>
        )}
        <StudioButton variant="ghost" size="sm" onClick={onLogout}>
          {STUDIO_STRINGS.auth.logoutButton}
        </StudioButton>
      </div>
    </header>
  );
}
