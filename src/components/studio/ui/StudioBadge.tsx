"use client";

type BadgeVariant = "active" | "approved" | "discarded" | "info";

interface StudioBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string; border: string }
> = {
  active: {
    bg: "bg-(--st-info-muted)",
    text: "text-(--st-info)",
    dot: "bg-(--st-info)",
    border: "border-(--st-info-border)",
  },
  approved: {
    bg: "bg-(--st-success-muted)",
    text: "text-(--st-success)",
    dot: "bg-(--st-success)",
    border: "border-(--st-success-border)",
  },
  discarded: {
    bg: "bg-(--st-danger-muted)",
    text: "text-(--st-danger)",
    dot: "bg-(--st-danger)",
    border: "border-(--st-danger-border)",
  },
  info: {
    bg: "bg-(--st-warning-muted)",
    text: "text-(--st-warning)",
    dot: "bg-(--st-warning)",
    border: "border-(--st-warning-border)",
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
      className={`inline-flex items-center gap-1.5 rounded-(--st-radius-full) border px-2.5 py-1 text-[11px] font-medium ${s.bg} ${s.text} ${s.border}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {label}
    </span>
  );
}
