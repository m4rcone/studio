"use client";

import { useCallback, useRef, useState } from "react";

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

  const buttonLabel =
    status === "streaming"
      ? "Sending…"
      : status === "preparing"
        ? "Starting…"
        : "Send";

  return (
    <div className="border-t border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 py-4 sm:px-6">
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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="st-focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-(--st-radius-full) bg-(--st-accent) px-4 text-sm font-medium text-(--st-accent-text) transition-colors hover:bg-(--st-accent-hover) disabled:bg-(--st-line-strong) disabled:text-(--st-text-muted)"
            aria-label="Send message"
          >
            {status === "streaming" ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
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
            ) : null}
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
