"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-(--st-accent) text-(--st-accent-text) shadow-(--st-shadow-sm) hover:bg-(--st-accent-hover)",
  secondary:
    "border border-(--st-border) bg-(--st-bg-surface) text-(--st-text) shadow-(--st-shadow-sm) hover:border-(--st-border-strong) hover:bg-(--st-bg-hover)",
  ghost:
    "border border-transparent bg-transparent text-(--st-text-secondary) hover:bg-(--st-bg-hover) hover:text-(--st-text)",
  danger:
    "border border-transparent bg-(--st-danger) text-white shadow-(--st-shadow-sm) hover:bg-(--st-danger-strong)",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-3 py-2 text-xs",
  md: "gap-2 px-4 py-2.5 text-sm",
  lg: "gap-2 px-5 py-3 text-sm",
};

export const StudioButton = forwardRef<HTMLButtonElement, StudioButtonProps>(
  function StudioButton(
    {
      variant = "primary",
      size = "md",
      loading,
      disabled,
      className = "",
      children,
      type,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`st-focus-ring inline-flex items-center justify-center rounded-(--st-radius-full) font-medium transition-[background-color,border-color,color,opacity,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
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
        )}
        {children}
      </button>
    );
  },
);
