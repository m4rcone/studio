"use client";

import { useCallback, useRef } from "react";
import type { StreamEvent } from "@/lib/studio/types";

export function useStreamingResponse() {
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(async function* (
    url: string,
    body: Record<string, unknown>,
  ): AsyncGenerator<StreamEvent> {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      yield { type: "error", message: err.error || `Error ${res.status}` };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield { type: "error", message: "No response body" };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7);
        } else if (line.startsWith("data: ") && eventType) {
          try {
            const event = JSON.parse(line.slice(6)) as StreamEvent;
            yield event;
          } catch {
            // Ignore parse errors
          }
          eventType = "";
        }
      }
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { stream, abort };
}
