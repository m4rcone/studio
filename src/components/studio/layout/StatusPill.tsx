"use client";

import { StudioBadge } from "../ui/StudioBadge";

interface StatusPillProps {
  label: string;
  variant: "active" | "approved" | "discarded";
}

export function StatusPill({ label, variant }: StatusPillProps) {
  return <StudioBadge label={label} variant={variant} />;
}
