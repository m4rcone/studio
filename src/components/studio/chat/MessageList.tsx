"use client";

import { useAutoScroll } from "@/hooks/studio/useAutoScroll";
import { ChatMessage } from "./ChatMessage";
import { StreamingIndicator } from "./StreamingIndicator";
import type { UIChatMessage } from "@/hooks/studio/useChat";

interface MessageListProps {
  messages: UIChatMessage[];
  isStreaming: boolean;
  sessionId: string | null;
  onApplyProposal?: (proposalId: string) => Promise<boolean>;
  onRejectProposal?: (proposalId: string) => Promise<boolean>;
  onProposalApplied?: () => void;
}

export function MessageList({
  messages,
  isStreaming,
  sessionId,
  onApplyProposal,
  onRejectProposal,
  onProposalApplied,
}: MessageListProps) {
  const { ref, handleScroll } = useAutoScroll<HTMLDivElement>([
    messages,
    isStreaming,
  ]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
    >
      {messages.length === 0 ? (
        // Empty state with starter prompts - commented for future reuse
        // <div className="flex min-h-full items-center justify-center">
        //   <div className="w-full max-w-2xl rounded-(--st-radius-lg) border border-dashed border-(--st-border-strong) bg-(--st-bg-subtle) p-6 text-center sm:p-8">
        //     <p className="text-sm text-(--st-text-secondary)">
        //       Start with a request.
        //     </p>

        //     <div className="mt-5 flex flex-wrap justify-center gap-2">
        //       {starterPrompts.map((suggestion) => (
        //         <div
        //           key={suggestion}
        //           className="rounded-(--st-radius-full) border border-(--st-border-subtle) bg-(--st-bg-surface) px-3 py-2 text-sm text-(--st-text-secondary)"
        //         >
        //           {suggestion}
        //         </div>
        //       ))}
        //     </div>
        //   </div>
        // </div>

        // Creative empty state
        <div className="flex min-h-full flex-col items-center justify-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-(--st-radius-lg) bg-(--st-bg-subtle)">
            <svg
              className="h-12 w-12 text-(--st-text-muted) opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-4-2m4 2l4-2"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-(--st-text)">
              Start with a request!
            </h3>
            <p className="max-w-sm text-sm text-(--st-text-muted)">
              Tell me what you&apos;d like to change on your site, and I&apos;ll
              help you bring it to life.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              sessionId={sessionId}
              isWorking={isStreaming}
              onApplyProposal={onApplyProposal}
              onRejectProposal={onRejectProposal}
              onProposalApplied={onProposalApplied}
            />
          ))}
          {isStreaming ? <StreamingIndicator /> : null}
        </div>
      )}
    </div>
  );
}
