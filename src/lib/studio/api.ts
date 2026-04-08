const STUDIO_API_BASE = "/api/studio";

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${STUDIO_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const studioApi = {
  auth: {
    login: (username: string, password: string) =>
      fetchAPI<{ role: string }>("/auth", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    me: () => fetchAPI<{ sub: string; role: string }>("/auth/me"),
    logout: () => fetchAPI<void>("/auth/logout", { method: "POST" }),
  },
};
