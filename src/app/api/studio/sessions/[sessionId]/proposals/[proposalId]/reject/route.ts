import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import { getSession } from "@/lib/studio/session-store";
import { getProposal, updateProposalStatus } from "@/lib/studio/proposal";
import { acquireLock, releaseLock } from "@/lib/studio/store";

interface RouteParams {
  params: Promise<{ sessionId: string; proposalId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAuth();
    const { sessionId, proposalId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 },
      );
    }

    const locked = await acquireLock(sessionId);
    if (!locked) {
      return NextResponse.json(
        { error: "Session is being processed" },
        { status: 409 },
      );
    }

    try {
      const proposal = await getProposal(sessionId);

      if (!proposal || proposal.id !== proposalId) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 },
        );
      }

      if (proposal.status !== "pending") {
        return NextResponse.json(
          { error: `Proposal is ${proposal.status}` },
          { status: 400 },
        );
      }

      await updateProposalStatus(sessionId, "rejected");

      return NextResponse.json({ ok: true, status: "rejected" });
    } finally {
      await releaseLock(sessionId);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
