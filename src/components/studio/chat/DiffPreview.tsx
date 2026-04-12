"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FileDiff } from "@/lib/studio/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StudioButton } from "../ui/StudioButton";

interface DiffPreviewProps {
  diff: FileDiff;
}

export function DiffPreview({ diff }: DiffPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const beforePanelRef = useRef<HTMLDivElement>(null);
  const afterPanelRef = useRef<HTMLDivElement>(null);
  const beforeStr =
    typeof diff.before === "string"
      ? diff.before
      : JSON.stringify(diff.before, null, 2);
  const afterStr =
    typeof diff.after === "string"
      ? diff.after
      : JSON.stringify(diff.after, null, 2);
  const lineCount = useMemo(() => {
    return Math.max(beforeStr.split("\n").length, afterStr.split("\n").length);
  }, [afterStr, beforeStr]);
  const isLargeDiff =
    lineCount > 14 || beforeStr.length > 600 || afterStr.length > 600;
  const panelStateClasses = expanded
    ? "max-h-[22rem] overflow-auto sm:max-h-[28rem]"
    : "max-h-48 overflow-hidden";

  useEffect(() => {
    if (expanded) return;
    if (beforePanelRef.current) beforePanelRef.current.scrollTop = 0;
    if (afterPanelRef.current) afterPanelRef.current.scrollTop = 0;
  }, [expanded]);

  return (
    <div className="relative overflow-hidden rounded-(--st-radius) border border-(--st-border-subtle) bg-(--st-bg-subtle)">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-(--st-border-subtle) px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
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

        <span className="shrink-0 rounded-(--st-radius-full) border border-(--st-border-subtle) bg-(--st-bg-surface) px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-(--st-text-muted) uppercase">
          {lineCount} lines
        </span>
      </div>
      <div className="grid gap-px bg-(--st-border-subtle) sm:grid-cols-2">
        <div className="bg-(--st-danger-muted) p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-(--st-danger) uppercase">
            Before
          </p>
          <div
            ref={beforePanelRef}
            className={`relative rounded-(--st-radius-sm) ${panelStateClasses}`}
          >
            <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text-secondary)">
              {beforeStr}
            </pre>
            {isLargeDiff && !expanded ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
                style={{
                  background:
                    "linear-gradient(to top, var(--st-danger-muted), transparent)",
                }}
              />
            ) : null}
          </div>
        </div>
        <div className="bg-(--st-success-muted) p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-(--st-success) uppercase">
            After
          </p>
          <div
            ref={afterPanelRef}
            className={`relative rounded-(--st-radius-sm) ${panelStateClasses}`}
          >
            <pre className="font-(family-name:--st-font-mono) text-xs wrap-break-word whitespace-pre-wrap text-(--st-text)">
              {afterStr}
            </pre>
            {isLargeDiff && !expanded ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
                style={{
                  background:
                    "linear-gradient(to top, var(--st-success-muted), transparent)",
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      {isLargeDiff ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-4">
          <StudioButton
            type="button"
            variant={expanded ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="pointer-events-auto shadow-[0_10px_30px_rgb(0_0_0/0.24)] backdrop-blur-sm"
          >
            {expanded ? (
              <ChevronUp width={18} height={18} />
            ) : (
              <ChevronDown width={18} height={18} />
            )}
          </StudioButton>
        </div>
      ) : null}
    </div>
  );
}
