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
 * All URLs returned to the client include the Vercel bypass query param when configured.
 */
export async function getDeploymentStatus(
  branch: string,
): Promise<DeploymentStatus> {
  const estimatedUrl = buildEstimatedUrl(branch);
  const estimatedUrlForClient = withBypass(estimatedUrl);

  try {
    const deployment = await github.getLatestDeployment(branch);
    if (deployment) {
      const status = await github.getDeploymentStatus(deployment.id);
      if (status) {
        if (status.state === "success") {
          return {
            status: "ready",
            url: withBypass(status.url || estimatedUrl),
            estimatedUrl: estimatedUrlForClient,
          };
        }
        if (status.state === "failure" || status.state === "error") {
          return {
            status: "error",
            url: null,
            estimatedUrl: estimatedUrlForClient,
          };
        }
        // Not confirmed yet — fall through to URL ping as secondary check
      }
    }
  } catch {
    // GitHub API unavailable — fall through to URL ping
  }

  // Fallback: ping the estimated URL directly (using header bypass, not query param)
  const isLive = await pingUrl(estimatedUrl);
  if (isLive) {
    return {
      status: "ready",
      url: estimatedUrlForClient,
      estimatedUrl: estimatedUrlForClient,
    };
  }

  return { status: "building", url: null, estimatedUrl: estimatedUrlForClient };
}

/**
 * Append the Vercel automation bypass query parameter to a URL.
 * This allows browser clients (links, iframes) to access protected preview deployments.
 */
export function withBypass(url: string): string {
  const env = getEnv();
  if (!env.VERCEL_AUTOMATION_BYPASS_SECRET) return url;
  try {
    const previewUrl = new URL(url);
    previewUrl.searchParams.set(
      "x-vercel-protection-bypass",
      env.VERCEL_AUTOMATION_BYPASS_SECRET,
    );
    previewUrl.searchParams.set("x-vercel-set-bypass-cookie", "samesitenone");
    return previewUrl.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    const bypassParam = `x-vercel-protection-bypass=${encodeURIComponent(
      env.VERCEL_AUTOMATION_BYPASS_SECRET,
    )}`;
    const cookieParam = "x-vercel-set-bypass-cookie=samesitenone";
    const hasBypass = url.includes("x-vercel-protection-bypass=");
    const hasCookie = url.includes("x-vercel-set-bypass-cookie=");

    if (hasBypass && hasCookie) return url;
    if (hasBypass) return `${url}&${cookieParam}`;
    if (hasCookie) return `${url}${separator}${bypassParam}`;
    return `${url}${separator}${bypassParam}&${cookieParam}`;
  }
}

/**
 * Ping a URL to check if it responds successfully.
 * Passes Vercel's automation bypass header when the secret is configured,
 * which allows checking protected preview deployments.
 */
async function pingUrl(url: string): Promise<boolean> {
  const env = getEnv();
  const headers: Record<string, string> = {};
  if (env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    headers["x-vercel-protection-bypass"] = env.VERCEL_AUTOMATION_BYPASS_SECRET;
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(8000),
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
