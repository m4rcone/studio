"use client";

import { forwardRef } from "react";

interface StudioInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const StudioInput = forwardRef<HTMLInputElement, StudioInputProps>(
  function StudioInput({ label, error, id, className = "", ...props }, ref) {
    return (
      <div className="flex flex-col gap-2.5">
        {label && (
          <label
            htmlFor={id}
            className="px-2 text-[11px] font-semibold tracking-[0.16em] text-(--st-text-muted) uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`st-focus-ring min-h-12 rounded-(--st-radius-lg) border bg-(--st-bg-surface) px-4 py-3 text-sm text-(--st-text) shadow-[0_1px_0_rgb(255_255_255/0.04),inset_0_1px_0_rgb(255_255_255/0.03)] transition-[border-color,box-shadow,background-color,color] duration-150 placeholder:text-(--st-text-muted) ${error ? "border-(--st-danger) bg-(--st-danger-muted)/30" : "border-(--st-border-subtle) hover:border-(--st-border) focus:border-(--st-border-strong) focus:bg-(--st-bg-input) focus:shadow-[0_0_0_4px_var(--st-focus-soft),0_8px_20px_rgb(0_0_0/0.12)]"} ${className}`}
          {...props}
        />
        {error && (
          <p className="px-1 text-xs text-(--st-danger)" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
