import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/studio/auth";

export async function POST() {
  const cookie = clearAuthCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    cookie.name,
    cookie.value,
    cookie.options as Parameters<typeof response.cookies.set>[2],
  );
  return response;
}
