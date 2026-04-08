"use client";

import type { UIChatMessage } from "@/hooks/studio/useChat";
import { DiffPreview } from "./DiffPreview";
import { ProposalActions } from "./ProposalActions";

interface ChatMessageProps {
  message: UIChatMessage;
  sessionId: string | null;
  onProposalApplied?: () => void;
}

export function ChatMessage({
  message,
  sessionId,
  onProposalApplied,
}: ChatMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-(--st-text-muted) italic">
          {message.content}
        </p>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-(--st-radius) px-3.5 py-2.5 ${
          isUser
            ? "bg-(--st-accent) text-(--st-accent-text)"
            : "bg-(--st-bg-surface) text-(--st-text)"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {message.diffs && message.diffs.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.diffs.map((diff, i) => (
              <DiffPreview key={i} diff={diff} />
            ))}
          </div>
        )}

        {message.proposalId && sessionId && (
          <div className="mt-3">
            <ProposalActions
              sessionId={sessionId}
              proposalId={message.proposalId}
              onApplied={onProposalApplied}
            />
          </div>
        )}
      </div>
    </div>
  );
}
