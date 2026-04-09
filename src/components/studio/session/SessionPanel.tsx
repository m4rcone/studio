"use client";

import { useEffect, useState } from "react";
import type { StudioSession } from "@/lib/studio/types";
import { StudioBadge } from "../ui/StudioBadge";
import { StudioButton } from "../ui/StudioButton";

interface SessionPanelProps {
  session: StudioSession | null;
  loading?: boolean;
  previewRefreshNonce?: number;
  previewPending?: boolean;
  onPreviewSettled?: () => void;
  pendingAction?: "publish" | "discard" | null;
  onApprove: () => void;
  onDiscard: () => void;
}

interface PreviewStatus {
  status: string;
  url: string | null;
  estimatedUrl: string | null;
  bypassConfigured?: boolean;
}

interface PreviewState extends PreviewStatus {
  sessionId: string;
}

export function SessionPanel({
  session,
  loading = false,
  previewRefreshNonce = 0,
  previewPending = false,
  onPreviewSettled,
  pendingAction = null,
  onApprove,
  onDiscard,
}: SessionPanelProps) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [successfulPreviewCycleKey, setSuccessfulPreviewCycleKey] = useState<
    string | null
  >(null);
  const sessionId = session?.id ?? null;
  const branch = session?.branch ?? null;
  const previewCycleKey =
    sessionId && branch
      ? `${sessionId}:${branch}:${previewRefreshNonce}`
      : null;
  const activePreview = preview?.sessionId === sessionId ? preview : null;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!branch || !sessionId) {
      return;
    }

    const currentSessionId = sessionId;
    let cancelled = false;

    async function fetchPreview() {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/studio/sessions/${currentSessionId}/preview`,
          { cache: "no-store" },
        );
        if (cancelled) return;

        if (res.status === 404) {
          return;
        }

        if (!res.ok) {
          if (previewCycleKey) {
            setSuccessfulPreviewCycleKey(previewCycleKey);
          }
          return;
        }

        const nextPreview = (await res.json()) as PreviewStatus;
        if (previewCycleKey) {
          setSuccessfulPreviewCycleKey(previewCycleKey);
        }
        if (
          previewPending &&
          (nextPreview.status === "ready" || nextPreview.status === "error")
        ) {
          onPreviewSettled?.();
        }
        setPreview({ sessionId: currentSessionId, ...nextPreview });
      } catch {
        // Ignore transient preview polling failures
      }
    }

    const shouldPoll =
      isDocumentVisible &&
      previewCycleKey !== null &&
      successfulPreviewCycleKey !== previewCycleKey;

    if (!isDocumentVisible) {
      return () => {
        cancelled = true;
      };
    }

    void fetchPreview();

    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(() => {
      void fetchPreview();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    branch,
    sessionId,
    previewRefreshNonce,
    isDocumentVisible,
    onPreviewSettled,
    previewPending,
    previewCycleKey,
    successfulPreviewCycleKey,
  ]);

  if (loading || !session) {
    return (
      <aside className="st-panel p-5">
        <p className="text-sm text-(--st-text-muted)" role="status">
          Starting session…
        </p>
      </aside>
    );
  }

  const previewHref =
    activePreview?.url ?? activePreview?.estimatedUrl ?? session.previewUrl;
  const bypassConfigured = activePreview?.bypassConfigured ?? false;
  const previewStatus = activePreview?.status ?? (branch ? "building" : "idle");
  const effectivePreviewStatus =
    previewPending && previewStatus !== "error" ? "building" : previewStatus;

  // const previewMeta =
  //   effectivePreviewStatus === "ready"
  //     ? { label: "Live Preview", variant: "approved" as const }
  //     : effectivePreviewStatus === "error"
  //       ? { label: "Preview Issue", variant: "discarded" as const }
  //       : effectivePreviewStatus === "building"
  //         ? { label: "Building", variant: "info" as const }
  //         : { label: "Not Ready", variant: "info" as const };

  const sessionMeta =
    session.status === "approved"
      ? { label: "Published", variant: "approved" as const }
      : session.status === "discarded"
        ? { label: "Closed", variant: "discarded" as const }
        : { label: "Draft", variant: "active" as const };

  const publishingLocked = Boolean(pendingAction);

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
          {previewHref ? (
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
              Preview will appear after the first applied change.
            </div>
          )}

          {previewPending || effectivePreviewStatus === "building" ? (
            <p className="text-xs leading-relaxed text-(--st-text-muted)">
              Preview is being generated or updated. It may take a minute.
            </p>
          ) : null}

          {previewHref && !bypassConfigured ? (
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
            <dt className="text-sm text-(--st-text-muted)">Updates</dt>
            <dd className="text-sm font-semibold text-(--st-text) tabular-nums">
              {session.commitCount}
            </dd>
          </div>
        </dl>
      </section>

      <section className="st-panel px-5 py-4">
        {session.status === "active" && session.prNumber ? (
          <div className="space-y-2">
            <StudioButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={onApprove}
              loading={pendingAction === "publish"}
              disabled={publishingLocked}
            >
              {pendingAction === "publish" ? "Publishing…" : "Publish"}
            </StudioButton>

            <StudioButton
              variant="secondary"
              size="md"
              className="w-full"
              onClick={onDiscard}
              loading={pendingAction === "discard"}
              disabled={publishingLocked}
            >
              {pendingAction === "discard" ? "Discarding…" : "Discard"}
            </StudioButton>
          </div>
        ) : (
          <div className="rounded-(--st-radius) border border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 py-3 text-sm text-(--st-text-muted)">
            {session.status === "approved"
              ? "This chat is already published."
              : session.status === "discarded"
                ? "This draft is no longer active."
                : "Apply a change to unlock publishing."}
          </div>
        )}
      </section>
    </aside>
  );
}
