"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { StudioBadge } from "../ui/StudioBadge";
import { StudioButton } from "../ui/StudioButton";
import type { UIChatMessage } from "@/hooks/studio/useChat";
import { Plus } from "lucide-react";

interface ChatPanelProps {
  messages: UIChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sessionId: string | null;
  onSend: (message: string) => void;
  onApplyProposal?: (proposalId: string) => Promise<boolean>;
  onRejectProposal?: (proposalId: string) => Promise<boolean>;
  onProposalApplied?: () => void;
  onNewChat?: () => void;
  newChatLoading?: boolean;
  newChatDisabled?: boolean;
  sessionStatus?: "active" | "approved" | "discarded";
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  sessionId,
  onSend,
  onApplyProposal,
  onRejectProposal,
  onProposalApplied,
  onNewChat,
  newChatLoading = false,
  newChatDisabled = false,
  sessionStatus = "active",
}: ChatPanelProps) {
  const chatStatus = !sessionId
    ? "preparing"
    : isStreaming
      ? "streaming"
      : "ready";
  const chatLocked = sessionStatus !== "active";

  const statusCopy =
    chatStatus === "preparing"
      ? { label: "Starting", variant: "info" as const }
      : chatStatus === "streaming"
        ? { label: "Working", variant: "info" as const }
        : sessionStatus === "approved"
          ? { label: "Published", variant: "approved" as const }
          : sessionStatus === "discarded"
            ? { label: "Closed", variant: "discarded" as const }
            : { label: "Active", variant: "active" as const };

  return (
    <section className="st-panel flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-(--st-border-subtle) px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-(--st-text)">
            Content Editor
          </span>
          <StudioBadge
            label={statusCopy.label}
            variant={statusCopy.variant}
            dot={
              statusCopy.variant !== "approved" &&
              statusCopy.variant !== "discarded"
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {onNewChat ? (
            <StudioButton
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              loading={newChatLoading}
              disabled={newChatDisabled}
            >
              <Plus width={14} height={14} />
              {newChatLoading ? "Starting…" : "New Chat"}
            </StudioButton>
          ) : null}
        </div>
      </div>

      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        sessionId={sessionId}
        onApplyProposal={onApplyProposal}
        onRejectProposal={onRejectProposal}
        onProposalApplied={onProposalApplied}
      />

      {error ? (
        <div className="border-t border-(--st-danger-border) bg-(--st-danger-muted) px-4 py-3 sm:px-6">
          <p className="text-sm text-(--st-danger)" role="alert">
            {error}
          </p>
        </div>
      ) : null}

      {sessionStatus === "discarded" ? (
        <div className="border-t border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 py-3 sm:px-6">
          <p className="text-sm text-(--st-text-muted)">
            This chat is closed. Start a new chat to continue editing.
          </p>
        </div>
      ) : null}

      <ChatInput
        onSend={onSend}
        disabled={isStreaming || !sessionId || chatLocked}
        status={chatStatus}
      />
    </section>
  );
}
