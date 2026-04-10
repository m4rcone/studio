"use client";

import { forwardRef } from "react";

interface StudioInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const StudioInput = forwardRef<HTMLInputElement, StudioInputProps>(
  function StudioInput({ label, error, id, className = "", ...props }, ref) {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-semibold tracking-[0.18em] text-(--st-text-muted) uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`st-focus-ring rounded-(--st-radius) border border-(--st-border) bg-(--st-bg-input) px-4 py-3 text-sm text-(--st-text) shadow-[inset_0_1px_0_rgb(255_255_255_/_0.7)] transition-[border-color,box-shadow,background-color] placeholder:text-(--st-text-muted) ${error ? "border-(--st-danger)" : "focus:border-(--st-border-strong) focus:bg-(--st-bg-surface) focus:shadow-[0_0_0_4px_var(--st-focus-soft)]"} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-(--st-danger)" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
