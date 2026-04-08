"use client";

import { forwardRef } from "react";

interface StudioInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const StudioInput = forwardRef<HTMLInputElement, StudioInputProps>(
  function StudioInput({ label, error, id, className = "", ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-medium tracking-wider text-(--st-text-secondary) uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`st-focus-ring rounded-(--st-radius-sm) border border-(--st-border) bg-(--st-bg-input) px-3.5 py-2.5 text-sm text-(--st-text) transition-colors placeholder:text-(--st-text-muted) ${error ? "border-(--st-danger)" : "focus:border-(--st-accent)"} ${className}`}
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
