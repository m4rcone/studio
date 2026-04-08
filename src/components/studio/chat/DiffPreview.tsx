"use client";

import type { FileDiff } from "@/lib/studio/types";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

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
    <div className="overflow-hidden rounded-(--st-radius-sm) border border-(--st-border)">
      <div className="flex items-center gap-2 border-b border-(--st-border) bg-(--st-bg-elevated) px-3 py-1.5">
        <span className="font-(family-name:--st-font-mono) text-[11px] text-(--st-text-muted)">
          {diff.file}
        </span>
        <span className="text-(--st-gray-600)">&middot;</span>
        <span className="font-(family-name:--st-font-mono) text-[11px] text-(--st-text-muted)">
          {diff.path}
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-(--st-border)">
        <div className="bg-(--st-danger-muted) p-3">
          <p className="mb-1 text-[10px] font-medium tracking-wider text-(--st-danger) uppercase">
            {STUDIO_STRINGS.diff.before}
          </p>
          <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text-secondary)">
            {beforeStr}
          </pre>
        </div>
        <div className="bg-(--st-success-muted) p-3">
          <p className="mb-1 text-[10px] font-medium tracking-wider text-(--st-success) uppercase">
            {STUDIO_STRINGS.diff.after}
          </p>
          <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text)">
            {afterStr}
          </pre>
        </div>
      </div>
    </div>
  );
}
