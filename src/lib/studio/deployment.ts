import * as github from "./github";
import { getEnv } from "./env";

interface DeploymentStatus {
  status: "building" | "ready" | "error" | "unknown";
  url: string | null;
  estimatedUrl: string | null;
}

/**
 * Get the current deployment status for a branch.
 * Uses GitHub Deployments API with polling backoff.
 */
export async function getDeploymentStatus(
  branch: string,
): Promise<DeploymentStatus> {
  const estimatedUrl = buildEstimatedUrl(branch);

  try {
    const deployment = await github.getLatestDeployment(branch);
    if (!deployment) {
      return { status: "building", url: null, estimatedUrl };
    }

    const status = await github.getDeploymentStatus(deployment.id);
    if (!status) {
      return { status: "building", url: null, estimatedUrl };
    }

    if (status.state === "success") {
      return { status: "ready", url: status.url || estimatedUrl, estimatedUrl };
    }

    if (status.state === "failure" || status.state === "error") {
      return { status: "error", url: null, estimatedUrl };
    }

    return { status: "building", url: null, estimatedUrl };
  } catch {
    return { status: "unknown", url: null, estimatedUrl };
  }
}

/**
 * Build the predictable Vercel preview URL for a branch.
 * Format: https://{project}-git-{branch}-{team}.vercel.app
 */
function buildEstimatedUrl(branch: string): string {
  const env = getEnv();
  const projectName = env.VERCEL_PROJECT_NAME ?? env.GITHUB_REPO;
  const sanitizedBranch = branch.replace(/\//g, "-");
  // Team scope is typically the GitHub owner
  return `https://${projectName}-git-${sanitizedBranch}-${env.VERCEL_TEAM_SLUG}.vercel.app`;
}

/**
 * Poll deployment status with exponential backoff.
 * Yields status updates for SSE streaming.
 */
export async function* pollDeployment(
  branch: string,
  signal: AbortSignal,
  maxAttempts = 20,
): AsyncGenerator<DeploymentStatus> {
  let delay = 1000; // Start at 1s
  const maxDelay = 30000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal.aborted) return;

    const status = await getDeploymentStatus(branch);
    yield status;

    if (status.status === "ready" || status.status === "error") return;

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, maxDelay);
  }
}
