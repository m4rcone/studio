"use client";

import { useEffect, useRef } from "react";
import { StudioButton } from "./StudioButton";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = STUDIO_STRINGS.session.cancelButton,
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      confirmRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(e: Event) {
      e.preventDefault();
      onCancel();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto w-full max-w-sm overscroll-contain rounded-(--st-radius-lg) border border-(--st-border) bg-(--st-bg-elevated) p-0 shadow-(--st-shadow-lg)"
    >
      <div className="p-6">
        <h2 className="mb-1.5 text-base font-semibold text-(--st-text)">
          {title}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-(--st-text-secondary)">
          {description}
        </p>
        <div className="flex justify-end gap-2.5">
          <StudioButton variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </StudioButton>
          <StudioButton
            ref={confirmRef}
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </StudioButton>
        </div>
      </div>
    </dialog>
  );
}
