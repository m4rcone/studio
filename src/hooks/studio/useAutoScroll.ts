"use client";

import { useEffect, useRef, useCallback } from "react";

export function useAutoScroll<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const userScrolledUp = useRef(false);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    userScrolledUp.current = !isAtBottom;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || userScrolledUp.current) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, handleScroll };
}
