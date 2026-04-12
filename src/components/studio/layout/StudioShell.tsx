"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StudioHeader } from "./StudioHeader";
import { useAuth } from "@/hooks/studio/useAuth";
import { useSession } from "@/hooks/studio/useSession";
import { usePreviewStatus } from "@/hooks/studio/usePreviewStatus";
import { useChat, clearChatHistory } from "@/hooks/studio/useChat";
import { ChatPanel } from "../chat/ChatPanel";
import { SessionPanel } from "../session/SessionPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type ConfirmAction = "publish" | "discard" | "new-chat" | null;
type MobileTab = "chat" | "session";

export function StudioShell() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    session,
    loading: sessionLoading,
    error: sessionError,
    restoreOrCreateSession,
    refreshSession,
    approveSession,
    discardSession,
    startNewSession,
  } = useSession();
  const { bypassConfigured, previewHref } = usePreviewStatus(session);
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    applyProposal,
    rejectProposal,
  } = useChat(session?.id ?? null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const previousStreamingRef = useRef(isStreaming);

  useEffect(() => {
    if (user && !session && !sessionLoading && !sessionError) {
      void restoreOrCreateSession();
    }
  }, [user, session, sessionLoading, sessionError, restoreOrCreateSession]);

  useEffect(() => {
    const wasStreaming = previousStreamingRef.current;
    previousStreamingRef.current = isStreaming;

    if (wasStreaming && !isStreaming && session?.id) {
      void refreshSession(session.id);
    }
  }, [isStreaming, session?.id, refreshSession]);

  const isBootstrappingSession = Boolean(
    user && sessionLoading && !session && !sessionError,
  );

  async function handleConfirm() {
    if (!confirmAction || pendingAction) return;

    setActionError(null);
    setPendingAction(confirmAction);

    try {
      if (confirmAction === "publish") {
        await approveSession();
      } else if (confirmAction === "discard") {
        if (session) clearChatHistory(session.id);
        await discardSession();
      } else if (confirmAction === "new-chat") {
        const oldId = await startNewSession();
        if (oldId) clearChatHistory(oldId);
      }

      setConfirmAction(null);
    } catch {
      setActionError("Could not complete that action. Try again.");
    } finally {
      setPendingAction(null);
    }
  }

  const handleProposalApplied = useCallback(() => {
    if (!session?.id) return;
    void refreshSession(session.id);
  }, [refreshSession, session?.id]);

  if (authLoading) {
    return (
      <div className="studio flex min-h-screen items-center justify-center px-4">
        <div
          className="st-panel flex items-center gap-3 px-5 py-4 text-sm text-(--st-text-muted)"
          role="status"
        >
          <svg
            aria-hidden="true"
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
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="studio flex h-dvh min-h-dvh flex-col overflow-hidden">
      <a
        href="#studio-main"
        className="st-focus-ring sr-only absolute top-4 left-4 z-20 rounded-(--st-radius-full) bg-(--st-bg-surface) px-4 py-2 text-sm text-(--st-text) shadow-(--st-shadow-sm) focus:not-sr-only"
      >
        Skip to Content
      </a>

      <StudioHeader userName={user?.sub ?? null} onLogout={logout} />

      <main
        id="studio-main"
        className="mx-auto flex min-h-0 w-full max-w-300 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
      >
        {sessionError ? (
          <div className="mb-4 rounded-(--st-radius) border border-(--st-danger-border) bg-(--st-danger-muted) px-4 py-3">
            <p className="text-sm text-(--st-danger)" role="alert">
              {sessionError}
            </p>
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-4 rounded-(--st-radius) border border-(--st-danger-border) bg-(--st-danger-muted) px-4 py-3">
            <p className="text-sm text-(--st-danger)" role="alert">
              {actionError}
            </p>
          </div>
        ) : null}

        <div className="mb-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2 rounded-(--st-radius) border border-(--st-border-subtle) bg-(--st-bg-subtle) p-1">
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              aria-pressed={mobileTab === "chat"}
              className={`st-focus-ring rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors ${
                mobileTab === "chat"
                  ? "bg-(--st-bg-surface) text-(--st-text) shadow-(--st-shadow-sm)"
                  : "text-(--st-text-muted)"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("session")}
              aria-pressed={mobileTab === "session"}
              className={`st-focus-ring rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors ${
                mobileTab === "session"
                  ? "bg-(--st-bg-surface) text-(--st-text) shadow-(--st-shadow-sm)"
                  : "text-(--st-text-muted)"
              }`}
            >
              Session
              {session?.commitCount ? (
                <span className="ml-2 text-xs text-(--st-text-muted)">
                  {session.commitCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_292px] lg:overflow-hidden">
          <div
            className={`min-h-0 ${mobileTab === "session" ? "hidden lg:block" : ""}`}
          >
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              error={error}
              sessionId={session?.id ?? null}
              onSend={sendMessage}
              onApplyProposal={applyProposal}
              onRejectProposal={rejectProposal}
              onProposalApplied={
                session?.id ? handleProposalApplied : undefined
              }
              onNewChat={() => setConfirmAction("new-chat")}
              newChatLoading={pendingAction === "new-chat"}
              newChatDisabled={
                isStreaming || Boolean(pendingAction) || !session?.id
              }
              sessionStatus={session?.status}
            />
          </div>

          <div
            className={`min-h-0 ${mobileTab === "chat" ? "hidden lg:block" : ""}`}
          >
            <SessionPanel
              session={session}
              loading={isBootstrappingSession}
              bypassConfigured={bypassConfigured}
              previewHref={previewHref}
              onPublish={() => setConfirmAction("publish")}
              onDiscard={() => setConfirmAction("discard")}
              publishLoading={pendingAction === "publish"}
              discardLoading={pendingAction === "discard"}
              publishDisabled={
                Boolean(pendingAction) ||
                !session ||
                session.status !== "active" ||
                !session.prNumber
              }
              discardDisabled={
                Boolean(pendingAction) ||
                !session ||
                session.status !== "active" ||
                !session.prNumber
              }
            />
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmAction === "publish"}
        title="Publish Changes?"
        description="This will update the website with the changes in this session."
        confirmLabel="Publish"
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmAction(null)}
        loading={pendingAction === "publish"}
      />

      <ConfirmDialog
        open={confirmAction === "discard"}
        title="Discard Changes?"
        description="This will close the current session and discard all changes."
        confirmLabel="Discard"
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmAction(null)}
        variant="danger"
        loading={pendingAction === "discard"}
      />

      <ConfirmDialog
        open={confirmAction === "new-chat"}
        title="Start a New Chat?"
        description="The current chat history will no longer appear here."
        confirmLabel="Start New Chat"
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmAction(null)}
        loading={pendingAction === "new-chat"}
      />
    </div>
  );
}
