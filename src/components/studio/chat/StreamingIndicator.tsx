"use client";

export function StreamingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-2"
      role="status"
      aria-label="Processing"
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
    </div>
  );
}
