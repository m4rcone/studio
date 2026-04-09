"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudioInput } from "../ui/StudioInput";
import { StudioButton } from "../ui/StudioButton";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError("Please check your email and password.");
        return;
      }

      router.push("/studio");
      router.refresh();
    } catch {
      setError("Connection error. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StudioInput
        id="username"
        name="username"
        type="email"
        autoComplete="username"
        required
        label="Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="you@email.com"
        disabled={loading}
        spellCheck={false}
      />

      <StudioInput
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        disabled={loading}
      />

      {error ? (
        <p className="text-sm text-(--st-danger)" role="alert">
          {error}
        </p>
      ) : null}

      <StudioButton
        type="submit"
        loading={loading}
        size="lg"
        className="w-full"
      >
        {loading ? "Signing In…" : "Sign In"}
      </StudioButton>
    </form>
  );
}
