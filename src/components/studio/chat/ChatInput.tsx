"use client";

import { useCallback, useRef, useState } from "react";
import { StudioButton } from "../ui/StudioButton";
import { ArrowUp, LoaderCircle } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  status?: "ready" | "preparing" | "streaming";
}

export function ChatInput({
  onSend,
  disabled,
  status = "ready",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const statusText =
    status === "preparing"
      ? "Starting…"
      : status === "streaming"
        ? "Working…"
        : "Enter to send. Shift + Enter for a new line.";

  return (
    <div className="border-t border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="rounded-(--st-radius-lg) border border-(--st-border) bg-(--st-bg-surface) p-3 shadow-(--st-shadow-sm)">
        <textarea
          ref={textareaRef}
          name="studio-message"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Describe the change you want…"
          disabled={disabled}
          rows={1}
          className="st-focus-ring min-h-12 w-full resize-none border-0 bg-transparent px-1 py-1.5 text-sm leading-relaxed text-(--st-text) placeholder:text-(--st-text-muted)"
          aria-label="Message"
        />

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-(--st-border-subtle) pt-3">
          <p className="text-xs text-(--st-text-muted)">{statusText}</p>

          <StudioButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={false}
            disabled={!value.trim() || disabled}
            aria-label={
              status === "streaming"
                ? "Sending message"
                : status === "preparing"
                  ? "Preparing chat"
                  : "Send message"
            }
          >
            {status === "streaming" || status === "preparing" ? (
              <LoaderCircle
                width={20}
                height={20}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ArrowUp width={20} height={20} aria-hidden="true" />
            )}
          </StudioButton>
        </div>
      </div>
    </div>
  );
}
