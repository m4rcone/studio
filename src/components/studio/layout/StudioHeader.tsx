"use client";

import Link from "next/link";
import { StudioButton } from "../ui/StudioButton";

interface StudioHeaderProps {
  userName: string | null;
  onLogout?: () => void;
}

export function StudioHeader({ userName, onLogout }: StudioHeaderProps) {
  return (
    <header className="border-b border-(--st-border-subtle) bg-[rgb(255_255_255_/_0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--st-text)">Studio</p>
          <p className="text-xs text-(--st-text-muted)">
            Content Editor Powered by AI
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="st-focus-ring inline-flex items-center text-sm font-medium text-(--st-text-muted) underline decoration-(--st-border-strong) underline-offset-4 transition-colors hover:text-(--st-text)"
          >
            View Site
          </Link>

          {userName ? (
            <span
              className="hidden max-w-[16rem] truncate text-xs text-(--st-text-muted) sm:inline"
              translate="no"
            >
              {userName}
            </span>
          ) : null}

          {onLogout ? (
            <StudioButton variant="ghost" size="sm" onClick={onLogout}>
              Sign Out
            </StudioButton>
          ) : null}
        </div>
      </div>
    </header>
  );
}
