"use client";

import type { StudioSession } from "@/lib/studio/types";
import { StudioBadge } from "../ui/StudioBadge";
import { StudioButton } from "../ui/StudioButton";
import {
  GitBranch,
  GitPullRequestArrow,
  GitPullRequestClosed,
  Lightbulb,
} from "lucide-react";
const studioTips = [
  "Ask for the page or section content structure first so you can see exactly what to change.",
  "Keep each request focused on one change at a time.",
];

interface SessionPanelProps {
  session: StudioSession | null;
  loading?: boolean;
  bypassConfigured?: boolean;
  previewHref?: string | null;
  onPublish?: () => void;
  onDiscard?: () => void;
  publishLoading?: boolean;
  discardLoading?: boolean;
  publishDisabled?: boolean;
  discardDisabled?: boolean;
}

export function SessionPanel({
  session,
  loading = false,
  // bypassConfigured = false,
  previewHref = null,
  onPublish,
  onDiscard,
  publishLoading = false,
  discardLoading = false,
  publishDisabled = false,
  discardDisabled = false,
}: SessionPanelProps) {
  if (loading || !session) {
    return (
      <aside className="st-panel p-5">
        <p className="text-sm text-(--st-text-muted)" role="status">
          Starting session…
        </p>
      </aside>
    );
  }

  const sessionMeta =
    session.status === "approved"
      ? { label: "Published", variant: "approved" as const }
      : session.status === "discarded"
        ? { label: "Closed", variant: "discarded" as const }
        : { label: "Active", variant: "active" as const };
  const canOpenPreview = Boolean(previewHref) && session.status !== "discarded";
  const previewMessage =
    session.status === "discarded"
      ? "Preview is unavailable for closed chats."
      : canOpenPreview
        ? "Applied changes may take up to a minute to appear on the page."
        : "Preview will appear after the first applied change.";

  return (
    <aside className="h-full space-y-4 overflow-y-auto lg:sticky lg:top-6 lg:max-h-full lg:overflow-y-auto">
      <section className="st-panel overflow-hidden">
        <div className="border-b border-(--st-border-subtle) px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-(--st-text)">
              Preview
            </span>
            {/* <StudioBadge label={previewMeta.label} variant={previewMeta.variant} /> */}
          </div>
        </div>

        <div className="space-y-3 px-5 py-4">
          <StudioButton
            variant="primary"
            size="md"
            disabled={!canOpenPreview}
            className="w-full"
            onClick={() => {
              if (!previewHref) return;
              window.open(previewHref, "_blank", "noopener,noreferrer");
            }}
          >
            <GitBranch width={14} height={14} />
            Open Preview
          </StudioButton>

          <p className="text-xs leading-relaxed text-(--st-text-muted)">
            {previewMessage}
          </p>
        </div>
      </section>

      <section className="st-panel overflow-hidden">
        <div className="border-b border-(--st-border-subtle) px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-(--st-text)">
              Session
            </span>
            <StudioBadge
              label={sessionMeta.label}
              variant={sessionMeta.variant}
              dot={
                sessionMeta.variant !== "approved" &&
                sessionMeta.variant !== "discarded"
              }
            />
          </div>
        </div>

        <dl className="divide-y divide-(--st-border-subtle)">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <dt className="text-sm text-(--st-text-muted)">Applied Changes</dt>
            <dd className="text-sm font-semibold text-(--st-text) tabular-nums">
              {session.commitCount}
            </dd>
          </div>
        </dl>
        <div className="grid grid-cols-2 gap-2 px-5 py-4">
          {onPublish ? (
            <StudioButton
              variant="primary"
              size="md"
              onClick={onPublish}
              loading={publishLoading}
              disabled={publishDisabled}
              className="w-full"
            >
              <GitPullRequestArrow width={14} height={14} />
              {/* <Loader2 className={"animate-spin"} width={14} height={14} /> */}
              {publishLoading ? "Publishing…" : "Publish"}
            </StudioButton>
          ) : null}

          {onDiscard ? (
            <StudioButton
              variant="secondary"
              size="md"
              onClick={onDiscard}
              loading={discardLoading}
              disabled={discardDisabled}
              className="w-full"
            >
              <GitPullRequestClosed width={14} height={14} />
              {discardLoading ? "Discarding…" : "Discard"}
            </StudioButton>
          ) : null}
        </div>
      </section>

      <section className="st-panel overflow-hidden">
        <div className="border-b border-(--st-border-subtle) px-5 py-4">
          <span className="flex items-center gap-2 text-sm font-medium text-(--st-text)">
            <Lightbulb width={14} height={14} />
            Tips
          </span>
        </div>

        <div className="px-5 py-4">
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-(--st-text-secondary) marker:text-(--st-text-muted)">
            {studioTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </aside>
  );
}
