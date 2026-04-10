"use client";

import type { StudioSession } from "@/lib/studio/types";
import { StudioBadge } from "../ui/StudioBadge";

const studioTips = [
  "Ask for the page or section content structure first so you can see exactly what to change. The structure comes as JSON.",
  "Reference the section name and the specific field you want to change to get a more precise proposal.",
  "Keep each request focused on one change at a time when you want faster review and approval.",
];

interface SessionPanelProps {
  session: StudioSession | null;
  loading?: boolean;
  bypassConfigured?: boolean;
  previewHref?: string | null;
  previewPending?: boolean;
  previewStatus?: string;
}

export function SessionPanel({
  session,
  loading = false,
  bypassConfigured = false,
  previewHref = null,
  previewPending = false,
  previewStatus = "idle",
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

  const effectivePreviewStatus =
    previewPending && previewStatus !== "error" ? "building" : previewStatus;

  const sessionMeta =
    session.status === "approved"
      ? { label: "Published", variant: "approved" as const }
      : session.status === "discarded"
        ? { label: "Closed", variant: "discarded" as const }
        : { label: "Draft", variant: "active" as const };

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
          {previewHref && session.status !== "discarded" ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="st-focus-ring st-link-button st-link-button-primary w-full"
            >
              Open Preview
            </a>
          ) : (
            <div className="rounded-(--st-radius) border border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 py-3 text-sm text-(--st-text-muted)">
              {session.status === "discarded"
                ? "Preview is unavailable for closed chats."
                : "Preview will appear after the first applied change."}
            </div>
          )}

          {session.status !== "discarded" &&
          (previewPending || effectivePreviewStatus === "building") ? (
            <p className="text-xs leading-relaxed text-(--st-text-muted)">
              Preview is being generated or updated. It may take a minute.
            </p>
          ) : null}

          {previewHref &&
          session.status !== "discarded" &&
          !bypassConfigured ? (
            <p className="text-xs leading-relaxed text-(--st-text-muted)">
              This environment has no Vercel automation bypass secret
              configured, so protected previews may still ask for
              authentication.
            </p>
          ) : null}
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
      </section>

      <section className="st-panel overflow-hidden">
        <div className="border-b border-(--st-border-subtle) px-5 py-4">
          <span className="text-sm font-medium text-(--st-text)">Tips</span>
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
