import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import { getSession, updateSession } from "@/lib/studio/session-store";
import * as github from "@/lib/studio/github";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAuth();
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active" || !session.prNumber) {
      return NextResponse.json(
        { error: "No active PR to merge" },
        { status: 400 },
      );
    }

    // Merge the PR (squash)
    await github.mergePullRequest(session.prNumber);

    // Update session status
    session.status = "approved";
    await updateSession(session);

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
