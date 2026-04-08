"use client";

import { useState, useEffect } from "react";
import { StudioHeader } from "./StudioHeader";
import { StatusPill } from "./StatusPill";
import { useAuth } from "@/hooks/studio/useAuth";
import { useSession } from "@/hooks/studio/useSession";
import { useChat } from "@/hooks/studio/useChat";
import { ChatPanel } from "../chat/ChatPanel";
import { SessionPanel } from "../session/SessionPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

type MobileTab = "chat" | "session";

export function StudioShell() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    session,
    error: sessionError,
    restoreOrCreateSession,
    refreshSession,
    approveSession,
    discardSession,
  } = useSession();
  const { messages, isStreaming, error, sendMessage } = useChat(
    session?.id ?? null,
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [confirmAction, setConfirmAction] = useState<
    "publish" | "discard" | null
  >(null);

  const s = STUDIO_STRINGS.session;

  useEffect(() => {
    if (user && !session) {
      restoreOrCreateSession();
    }
  }, [user, session, restoreOrCreateSession]);

  useEffect(() => {
    if (!isStreaming && session?.id) {
      refreshSession(session.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  const statusVariant = session
    ? session.status === "active"
      ? ("active" as const)
      : session.status === "approved"
        ? ("approved" as const)
        : ("discarded" as const)
    : ("active" as const);

  const statusLabel = session
    ? session.status === "active"
      ? s.statusActive
      : session.status === "approved"
        ? s.statusApproved
        : s.statusDiscarded
    : undefined;

  async function handleConfirm() {
    if (confirmAction === "publish") {
      await approveSession();
    } else if (confirmAction === "discard") {
      await discardSession();
    }
    setConfirmAction(null);
  }

  if (authLoading) {
    return (
      <div className="studio flex h-screen items-center justify-center">
        <div
          className="flex items-center gap-2 text-sm text-(--st-text-muted)"
          role="status"
        >
          <svg
            className="h-4 w-4 animate-spin text-(--st-accent)"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
          {STUDIO_STRINGS.preview.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="studio flex h-screen flex-col">
      {sessionError && (
        <div className="flex items-center gap-2 border-b border-(--st-danger-muted) bg-(--st-danger-muted) px-4 py-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-(--st-danger)"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-(--st-danger)">{sessionError}</p>
          <button
            onClick={() => restoreOrCreateSession()}
            className="st-focus-ring ml-auto text-xs text-(--st-danger) underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}
      <StudioHeader
        userName={user?.sub ?? null}
        sessionStatus={statusLabel}
        statusVariant={statusVariant}
        onLogout={logout}
      />

      {/* Mobile tab bar */}
      <div className="flex border-b border-(--st-border) lg:hidden">
        <button
          onClick={() => setMobileTab("chat")}
          className={`st-focus-ring flex-1 py-2.5 text-center text-xs font-medium tracking-wider uppercase transition-colors ${
            mobileTab === "chat"
              ? "border-b-2 border-(--st-accent) text-(--st-text)"
              : "text-(--st-text-muted) hover:text-(--st-text-secondary)"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileTab("session")}
          className={`st-focus-ring flex-1 py-2.5 text-center text-xs font-medium tracking-wider uppercase transition-colors ${
            mobileTab === "session"
              ? "border-b-2 border-(--st-accent) text-(--st-text)"
              : "text-(--st-text-muted) hover:text-(--st-text-secondary)"
          }`}
        >
          {s.previewLabel}
          {session?.commitCount ? (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-(--st-accent) px-1 text-[10px] text-(--st-accent-text)">
              {session.commitCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Mobile floating status */}
      {session && statusLabel && (
        <div className="absolute top-14 right-4 z-10 lg:hidden">
          <StatusPill label={statusLabel} variant={statusVariant} />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Chat panel */}
        <div
          className={`flex min-h-0 flex-1 flex-col lg:w-3/5 ${mobileTab !== "chat" ? "hidden lg:flex" : ""}`}
        >
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            error={error}
            sessionId={session?.id ?? null}
            onSend={sendMessage}
            onProposalApplied={session?.id ? () => refreshSession(session.id!) : undefined}
          />
        </div>

        {/* Session panel */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto border-l border-(--st-border) lg:block lg:w-2/5 ${mobileTab !== "session" ? "hidden lg:block" : ""}`}
        >
          <SessionPanel
            session={session}
            onApprove={() => setConfirmAction("publish")}
            onDiscard={() => setConfirmAction("discard")}
          />
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAction === "publish"}
        title={s.publishButton}
        description={s.publishConfirm}
        confirmLabel={s.publishButton}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "discard"}
        title={s.discardButton}
        description={s.discardConfirm}
        confirmLabel={s.discardButton}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        variant="danger"
      />
    </div>
  );
}
