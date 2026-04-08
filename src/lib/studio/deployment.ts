import * as github from "./github";
import { getEnv } from "./env";

interface DeploymentStatus {
  status: "building" | "ready" | "error" | "unknown";
  url: string | null;
  estimatedUrl: string | null;
}

/**
 * Get the current deployment status for a branch.
 * Tries GitHub Deployments API first, falls back to pinging the estimated URL.
 */
export async function getDeploymentStatus(
  branch: string,
): Promise<DeploymentStatus> {
  const estimatedUrl = buildEstimatedUrl(branch);

  try {
    const deployment = await github.getLatestDeployment(branch);
    if (deployment) {
      const status = await github.getDeploymentStatus(deployment.id);
      if (status) {
        if (status.state === "success") {
          return {
            status: "ready",
            url: status.url || estimatedUrl,
            estimatedUrl,
          };
        }
        if (status.state === "failure" || status.state === "error") {
          return { status: "error", url: null, estimatedUrl };
        }
        // Not confirmed yet — fall through to URL ping as secondary check
      }
    }
  } catch {
    // GitHub API unavailable — fall through to URL ping
  }

  // Fallback: ping the estimated URL directly
  const isLive = await pingUrl(estimatedUrl);
  if (isLive) {
    return { status: "ready", url: estimatedUrl, estimatedUrl };
  }

  return { status: "building", url: null, estimatedUrl };
}

/**
 * Ping a URL to check if it responds successfully.
 */
async function pingUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
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
