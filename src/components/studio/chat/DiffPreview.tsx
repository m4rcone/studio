"use client";

import type { FileDiff } from "@/lib/studio/types";

interface DiffPreviewProps {
  diff: FileDiff;
}

export function DiffPreview({ diff }: DiffPreviewProps) {
  const beforeStr =
    typeof diff.before === "string"
      ? diff.before
      : JSON.stringify(diff.before, null, 2);
  const afterStr =
    typeof diff.after === "string"
      ? diff.after
      : JSON.stringify(diff.after, null, 2);

  return (
    <div className="overflow-hidden rounded-(--st-radius) border border-(--st-border-subtle) bg-(--st-bg-subtle)">
      <div className="flex flex-wrap items-center gap-2 border-b border-(--st-border-subtle) px-4 py-3">
        <span className="text-[11px] font-semibold tracking-[0.18em] text-(--st-text-muted) uppercase">
          Updated area
        </span>
        <span
          className="font-(family-name:--st-font-mono) text-[11px] text-(--st-text-muted)"
          translate="no"
        >
          {diff.file}
        </span>
        <span className="text-(--st-text-muted)">&middot;</span>
        <span
          className="font-(family-name:--st-font-mono) text-[11px] text-(--st-text-muted)"
          translate="no"
        >
          {diff.path}
        </span>
      </div>
      <div className="grid gap-px bg-(--st-border-subtle) sm:grid-cols-2">
        <div className="bg-(--st-danger-muted) p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-(--st-danger) uppercase">
            Before
          </p>
          <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text-secondary)">
            {beforeStr}
          </pre>
        </div>
        <div className="bg-(--st-success-muted) p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-(--st-success) uppercase">
            After
          </p>
          <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text)">
            {afterStr}
          </pre>
        </div>
      </div>
    </div>
  );
}
