import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/studio/auth";
import { getSession } from "@/lib/studio/session-store";
import { getDeploymentStatus } from "@/lib/studio/deployment";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAuth();
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.branch) {
      return NextResponse.json(
        {
          status: "no_branch",
          url: null,
          estimatedUrl: null,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        },
      );
    }

    const deploymentStatus = await getDeploymentStatus(
      session.branch,
      session.latestCommitSha,
    );
    return NextResponse.json(deploymentStatus, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
