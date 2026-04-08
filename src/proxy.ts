import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for UX redirect only — NOT a security layer.
 * Real auth is enforced by verifyAuth() in each API route and studio layout.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page and auth API routes
  if (pathname === "/studio/login" || pathname.startsWith("/api/studio/auth")) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("studio-token")?.value;
  if (!token) {
    const loginUrl = new URL("/studio/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio", "/studio/((?!login).*)"],
};
