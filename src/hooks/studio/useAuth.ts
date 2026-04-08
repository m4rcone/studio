"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  user: { sub: string; role: string } | null;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    fetch("/api/studio/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((user) => setState({ user, loading: false }))
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/studio/auth/logout", { method: "POST" });
    setState({ user: null, loading: false });
    router.push("/studio/login");
  }, [router]);

  return { ...state, logout };
}
