"use client";

import { useAutoScroll } from "@/hooks/studio/useAutoScroll";
import { ChatMessage } from "./ChatMessage";
import { StreamingIndicator } from "./StreamingIndicator";
import type { UIChatMessage } from "@/hooks/studio/useChat";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

interface MessageListProps {
  messages: UIChatMessage[];
  isStreaming: boolean;
  sessionId: string | null;
}

export function MessageList({
  messages,
  isStreaming,
  sessionId,
}: MessageListProps) {
  const { ref, handleScroll } = useAutoScroll<HTMLDivElement>([
    messages,
    isStreaming,
  ]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overscroll-contain px-4 py-6"
    >
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--st-text-muted)"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <p className="max-w-xs text-center text-sm text-(--st-text-muted)">
            {STUDIO_STRINGS.chat.emptyState}
          </p>
        </div>
      )}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} sessionId={sessionId} />
      ))}
      {isStreaming && <StreamingIndicator />}
    </div>
  );
}
