"use client";

import { useState, useRef, useCallback } from "react";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
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
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  return (
    <div className="border-t border-(--st-border) bg-(--st-bg-elevated) p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          name="studio-message"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={STUDIO_STRINGS.chat.placeholder}
          disabled={disabled}
          rows={1}
          className="st-focus-ring min-h-10 flex-1 resize-none rounded-(--st-radius-sm) border border-(--st-border) bg-(--st-bg-input) px-3.5 py-2.5 text-sm text-(--st-text) placeholder:text-(--st-text-muted) focus:border-(--st-accent)"
          aria-label="Message input"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="st-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-(--st-radius-sm) bg-(--st-accent) text-(--st-accent-text) transition-all hover:bg-(--st-accent-hover) disabled:opacity-40"
          aria-label="Send message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
