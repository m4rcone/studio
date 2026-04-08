import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import { getSession, deleteSession } from "@/lib/studio/session-store";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  let auth;
  try {
    auth = await verifyAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("[studio] GET /sessions/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  let auth;
  try {
    auth = await verifyAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.prNumber) {
      const github = await import("@/lib/studio/github");
      await github.closePullRequest(session.prNumber);
      if (session.branch) {
        await github.deleteBranch(session.branch);
      }
    }

    session.status = "discarded";
    await deleteSession(sessionId, auth.sub);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[studio] DELETE /sessions/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
