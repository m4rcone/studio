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
    "bg-(--st-accent) hover:bg-(--st-accent-hover) text-(--st-accent-text) shadow-(--st-shadow-sm)",
  secondary:
    "bg-(--st-bg-hover) hover:bg-(--st-gray-700) text-(--st-text) border border-(--st-border)",
  ghost:
    "bg-transparent hover:bg-(--st-bg-hover) text-(--st-text-secondary) hover:text-(--st-text)",
  danger:
    "bg-(--st-danger) hover:brightness-110 text-white shadow-(--st-shadow-sm)",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs gap-1.5",
  md: "px-3.5 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-sm gap-2",
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
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`st-focus-ring inline-flex items-center justify-center font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${variantStyles[variant]} ${sizeStyles[size]} rounded-(--st-radius-sm) ${className}`}
        {...props}
      >
        {loading && (
          <svg
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
