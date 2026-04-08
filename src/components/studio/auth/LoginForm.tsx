"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STUDIO_STRINGS } from "@/lib/studio/constants";
import { StudioInput } from "../ui/StudioInput";
import { StudioButton } from "../ui/StudioButton";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const s = STUDIO_STRINGS.auth;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/studio/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError(s.loginError);
        return;
      }

      router.push("/studio");
      router.refresh();
    } catch {
      setError(STUDIO_STRINGS.errors.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StudioInput
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        required
        label={s.usernameLabel}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={s.usernamePlaceholder}
      />

      <StudioInput
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        label={s.passwordLabel}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={s.passwordPlaceholder}
      />

      {error && (
        <p className="text-sm text-(--st-danger)" role="alert">
          {error}
        </p>
      )}

      <StudioButton
        type="submit"
        loading={loading}
        size="lg"
        className="w-full"
      >
        {s.loginButton}
      </StudioButton>
    </form>
  );
}
