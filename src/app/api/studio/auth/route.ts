import { NextResponse } from "next/server";
import { authenticateUser, setAuthCookie } from "@/lib/studio/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const result = await authenticateUser(username, password);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const cookie = setAuthCookie(result.token);
    const response = NextResponse.json({ role: result.role });
    response.cookies.set(
      cookie.name,
      cookie.value,
      cookie.options as Parameters<typeof response.cookies.set>[2],
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
