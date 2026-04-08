"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { UIChatMessage } from "@/hooks/studio/useChat";

interface ChatPanelProps {
  messages: UIChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sessionId: string | null;
  onSend: (message: string) => void;
  onProposalApplied?: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  sessionId,
  onSend,
  onProposalApplied,
}: ChatPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        sessionId={sessionId}
        onProposalApplied={onProposalApplied}
      />
      {error && (
        <div className="border-t border-(--st-border) px-4 py-2">
          <p className="text-xs text-(--st-danger)" role="alert">
            {error}
          </p>
        </div>
      )}
      <ChatInput onSend={onSend} disabled={isStreaming || !sessionId} />
    </div>
  );
}
