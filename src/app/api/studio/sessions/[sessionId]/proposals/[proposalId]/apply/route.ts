import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import { getSession, updateSession } from "@/lib/studio/session-store";
import { getProposal, updateProposalStatus } from "@/lib/studio/proposal";
import { applyProposal } from "@/lib/studio/apply";
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

    // Acquire lock
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

      // Apply the proposal
      const result = await applyProposal(proposal, session);

      // Update session
      session.branch = result.branch;
      session.prNumber = result.prNumber;
      session.prUrl = result.prUrl;
      session.commitCount += 1;
      session.changedFiles = Array.from(
        new Set([...session.changedFiles, ...proposal.affectedFiles]),
      );
      if (!session.title) {
        session.title = proposal.summary;
      }
      await updateSession(session);

      // Mark proposal as applied
      await updateProposalStatus(sessionId, "applied");

      return NextResponse.json({
        sha: result.sha,
        branch: result.branch,
        prNumber: result.prNumber,
        prUrl: result.prUrl,
      });
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
