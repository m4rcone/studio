import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import {
  createSession,
  getUserSessionIds,
  getSession,
} from "@/lib/studio/session-store";

export async function GET() {
  let auth;
  try {
    auth = await verifyAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ids = await getUserSessionIds(auth.sub);
    const sessions = await Promise.all(ids.map((id) => getSession(id)));
    return NextResponse.json(sessions.filter(Boolean));
  } catch (err) {
    console.error("[studio] GET /sessions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  let auth;
  try {
    auth = await verifyAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await createSession(auth.sub, auth.role);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("[studio] POST /sessions error:", err);
    return NextResponse.json(
      { error: "Failed to create session", detail: String(err) },
      { status: 500 },
    );
  }
}
