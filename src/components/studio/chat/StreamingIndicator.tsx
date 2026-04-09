"use client";

export function StreamingIndicator() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-(--st-radius-full) border border-(--st-border-subtle) bg-(--st-bg-subtle) px-4 py-2"
      role="status"
      aria-label="Working"
    >
      <span
        className="st-dot h-1.5 w-1.5 rounded-full bg-(--st-accent) motion-reduce:animate-none"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="st-dot h-1.5 w-1.5 rounded-full bg-(--st-accent) motion-reduce:animate-none"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="st-dot h-1.5 w-1.5 rounded-full bg-(--st-accent) motion-reduce:animate-none"
        style={{ animationDelay: "400ms" }}
      />
      <span className="text-xs text-(--st-text-secondary)">Working</span>
    </div>
  );
}
