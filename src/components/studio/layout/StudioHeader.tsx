"use client";

import Link from "next/link";
import { StudioButton } from "../ui/StudioButton";
import { Component, Globe, LogOut } from "lucide-react";

interface StudioHeaderProps {
  userName: string | null;
  onLogout?: () => void;
}

export function StudioHeader({ onLogout }: StudioHeaderProps) {
  return (
    <header className="border-b border-(--st-border-subtle) bg-(--st-bg-elevated) backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-300 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Component />
          <h1 className="text-lg font-semibold text-(--st-text)">Studio</h1>
          {/* <p className="text-xs text-(--st-text-muted)">
            Content Editor Powered by AI
          </p> */}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="st-focus-ring inline-flex items-center gap-1 text-xs font-medium text-(--st-text-muted) decoration-(--st-border-strong) transition-colors hover:text-(--st-text)"
          >
            <Globe width={14} height={14} />
            View Site
          </Link>

          {/* {userName ? (
            <span
              className="hidden max-w-[16rem] truncate text-xs text-(--st-text-muted) sm:inline"
              translate="no"
            >
              {userName}
            </span>
          ) : null} */}

          {onLogout ? (
            <StudioButton variant="ghost" size="sm" onClick={onLogout}>
              <LogOut width={14} height={14} />
              Sign Out
            </StudioButton>
          ) : null}
        </div>
      </div>
    </header>
  );
}
