"use client";

import type { UIChatMessage } from "@/hooks/studio/useChat";
import { DiffPreview } from "./DiffPreview";
import { ProposalActions } from "./ProposalActions";
import { StudioMarkdown } from "./StudioMarkdown";

interface ChatMessageProps {
  message: UIChatMessage;
  sessionId: string | null;
  isWorking?: boolean;
  onApplyProposal?: (proposalId: string) => Promise<boolean>;
  onRejectProposal?: (proposalId: string) => Promise<boolean>;
  onProposalApplied?: () => void;
}

export function ChatMessage({
  message,
  sessionId,
  isWorking = false,
  onApplyProposal,
  onRejectProposal,
  onProposalApplied,
}: ChatMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <p className="rounded-(--st-radius-full) border border-(--st-border-subtle) bg-(--st-bg-subtle) px-3 py-1.5 text-xs text-(--st-text-muted)">
          {message.content}
        </p>
      </div>
    );
  }

  const isUser = message.role === "user";
  const hasContent =
    Boolean(message.content) ||
    Boolean(message.diffs?.length) ||
    Boolean(message.proposalId);

  if (!hasContent) {
    return null;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex w-full max-w-[min(100%,52rem)] flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span className="px-1 text-[11px] font-semibold tracking-[0.16em] text-(--st-text-muted) uppercase">
          {isUser ? "You" : "Studio"}
        </span>

        <div
          className={`w-full rounded-[18px] border px-4 py-4 shadow-(--st-shadow-sm) ${
            isUser
              ? "border-transparent bg-(--st-user-bubble) text-white"
              : "border-(--st-border-subtle) bg-(--st-bg-surface) text-(--st-text)"
          }`}
        >
          {message.content ? (
            isUser ? (
              <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <StudioMarkdown content={message.content} />
            )
          ) : null}

          {message.diffs && message.diffs.length > 0 ? (
            <div className="mt-4 space-y-3 border-t border-black/8 pt-4">
              {message.diffs.map((diff, i) => (
                <DiffPreview key={i} diff={diff} />
              ))}
            </div>
          ) : null}

          {message.proposalId && sessionId ? (
            <div className="mt-4 border-t border-black/8 pt-4">
              <ProposalActions
                proposalState={message.proposalState ?? "pending"}
                disabled={isWorking}
                onApply={async () => {
                  if (!onApplyProposal) return;
                  const applied = await onApplyProposal(message.proposalId!);
                  if (applied) {
                    onProposalApplied?.();
                  }
                }}
                onDeny={() => onRejectProposal?.(message.proposalId!)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
