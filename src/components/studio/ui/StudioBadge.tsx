"use client";

type BadgeVariant = "active" | "approved" | "discarded" | "info";

interface StudioBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: "bg-(--st-success-muted)",
    text: "text-(--st-success)",
    dot: "bg-(--st-success)",
  },
  approved: {
    bg: "bg-(--st-info-muted)",
    text: "text-(--st-info)",
    dot: "bg-(--st-info)",
  },
  discarded: {
    bg: "bg-(--st-gray-800)",
    text: "text-(--st-text-muted)",
    dot: "bg-(--st-gray-500)",
  },
  info: {
    bg: "bg-(--st-gray-800)",
    text: "text-(--st-text-secondary)",
    dot: "bg-(--st-gray-400)",
  },
};

export function StudioBadge({
  label,
  variant = "info",
  dot = true,
}: StudioBadgeProps) {
  const s = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-(--st-radius-full) px-2.5 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {label}
    </span>
  );
}
