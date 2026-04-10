import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";
import { getEnv } from "./env";
import type { AuthPayload } from "./types";

const COOKIE_NAME = "studio-token";
const TOKEN_EXPIRY = "24h";

const authPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(["client", "team"]),
  iat: z.number().int(),
  exp: z.number().int(),
});

function getSecret() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

/**
 * Parse STUDIO_USERS env var.
 * Format: "user1@email.com:role1,user2@email.com:role2"
 */
function parseUsers(): Map<string, "client" | "team"> {
  const env = getEnv();
  const map = new Map<string, "client" | "team">();
  for (const entry of env.STUDIO_USERS.split(",")) {
    const [username, role] = entry.trim().split(":");
    if (username && (role === "client" || role === "team")) {
      map.set(username, role);
    }
  }
  return map;
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<{ token: string; role: "client" | "team" } | null> {
  const env = getEnv();
  const users = parseUsers();

  const role = users.get(username);
  if (!role || password !== env.STUDIO_PASSWORD) {
    return null;
  }

  const token = await new SignJWT({ sub: username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());

  return { token, role };
}

export async function verifyAuth(): Promise<AuthPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new Error("No auth token");
  }

  const { payload } = await jwtVerify(token, getSecret());
  return authPayloadSchema.parse(payload);
}

export function setAuthCookie(token: string): {
  name: string;
  value: string;
  options: Record<string, unknown>;
} {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    },
  };
}

export function clearAuthCookie(): {
  name: string;
  value: string;
  options: Record<string, unknown>;
} {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
