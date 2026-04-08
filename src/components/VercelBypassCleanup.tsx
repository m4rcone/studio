"use client";

import { useEffect } from "react";

const BYPASS_QUERY_PARAMS = [
  "x-vercel-protection-bypass",
  "x-vercel-set-bypass-cookie",
];

export function VercelBypassCleanup() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const hadBypassParams = BYPASS_QUERY_PARAMS.some((param) =>
      currentUrl.searchParams.has(param),
    );

    if (!hadBypassParams) return;

    for (const param of BYPASS_QUERY_PARAMS) {
      currentUrl.searchParams.delete(param);
    }

    const cleanUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState(window.history.state, "", cleanUrl);
  }, []);

  return null;
}
