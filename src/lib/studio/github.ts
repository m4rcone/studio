import { getEnv } from "./env";

interface GitHubRequestOptions {
  method?: string;
  body?: unknown;
}

async function githubFetch<T>(
  path: string,
  options: GitHubRequestOptions = {},
): Promise<T> {
  const env = getEnv();
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── File operations ──────────────────────────────────────────────────────────

interface GitHubFileContent {
  content: string;
  sha: string;
  encoding: string;
}

export async function readFile(
  path: string,
  branch?: string,
): Promise<{ content: string; sha: string }> {
  const ref = branch ?? getEnv().GITHUB_DEFAULT_BRANCH;
  const data = await githubFetch<GitHubFileContent>(
    `/contents/${path}?ref=${ref}`,
  );
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

interface GitHubDirEntry {
  name: string;
  path: string;
  type: "file" | "dir";
}

export async function listFiles(
  directory: string,
  branch?: string,
): Promise<string[]> {
  const ref = branch ?? getEnv().GITHUB_DEFAULT_BRANCH;
  const entries = await githubFetch<GitHubDirEntry[]>(
    `/contents/${directory}?ref=${ref}`,
  );
  return entries.filter((e) => e.type === "file").map((e) => e.path);
}

// ─── Branch operations ────────────────────────────────────────────────────────

interface GitRef {
  ref: string;
  object: { sha: string };
}

export async function getRef(branch: string): Promise<string> {
  const data = await githubFetch<GitRef>(`/git/ref/heads/${branch}`);
  return data.object.sha;
}

export async function createBranch(
  name: string,
  fromSha: string,
): Promise<void> {
  await githubFetch(`/git/refs`, {
    method: "POST",
    body: { ref: `refs/heads/${name}`, sha: fromSha },
  });
}

export async function deleteBranch(name: string): Promise<void> {
  await githubFetch(`/git/refs/heads/${name}`, { method: "DELETE" });
}

// ─── Commits (Git Trees API for multi-file atomic commits) ────────────────────

interface FileChange {
  path: string;
  content: string;
}

interface GitTree {
  sha: string;
}

interface GitCommit {
  sha: string;
}

export async function createMultiFileCommit(
  branch: string,
  files: FileChange[],
  message: string,
): Promise<string> {
  // 1. Get latest commit SHA
  const latestCommitSha = await getRef(branch);

  // 2. Get tree SHA from latest commit
  const commit = await githubFetch<{ tree: { sha: string } }>(
    `/git/commits/${latestCommitSha}`,
  );
  const baseTreeSha = commit.tree.sha;

  // 3. Create new tree with file changes
  const tree = files.map((f) => ({
    path: f.path,
    mode: "100644" as const,
    type: "blob" as const,
    content: f.content,
  }));

  const newTree = await githubFetch<GitTree>(`/git/trees`, {
    method: "POST",
    body: { base_tree: baseTreeSha, tree },
  });

  // 4. Create commit
  const newCommit = await githubFetch<GitCommit>(`/git/commits`, {
    method: "POST",
    body: {
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    },
  });

  // 5. Update branch ref
  await githubFetch(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: { sha: newCommit.sha },
  });

  return newCommit.sha;
}

// ─── Pull Requests ────────────────────────────────────────────────────────────

interface GitHubPR {
  number: number;
  html_url: string;
  state: string;
}

export async function createPullRequest(
  title: string,
  body: string,
  head: string,
  base?: string,
): Promise<{ number: number; url: string }> {
  const data = await githubFetch<GitHubPR>(`/pulls`, {
    method: "POST",
    body: {
      title,
      body,
      head,
      base: base ?? getEnv().GITHUB_DEFAULT_BRANCH,
    },
  });
  return { number: data.number, url: data.html_url };
}

export async function mergePullRequest(prNumber: number): Promise<void> {
  await githubFetch(`/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: { merge_method: "squash" },
  });
}

export async function closePullRequest(prNumber: number): Promise<void> {
  await githubFetch(`/pulls/${prNumber}`, {
    method: "PATCH",
    body: { state: "closed" },
  });
}

// ─── Deployments ──────────────────────────────────────────────────────────────

interface GitHubDeployment {
  id: number;
  environment: string;
}

interface GitHubDeploymentStatus {
  state: string;
  environment_url: string;
}

export async function getLatestDeployment(
  branch: string,
): Promise<{ id: number } | null> {
  const deployments = await githubFetch<GitHubDeployment[]>(
    `/deployments?ref=${branch}&per_page=1`,
  );
  return deployments.length > 0 ? { id: deployments[0].id } : null;
}

export async function getDeploymentStatus(
  deploymentId: number,
): Promise<{ state: string; url: string } | null> {
  const statuses = await githubFetch<GitHubDeploymentStatus[]>(
    `/deployments/${deploymentId}/statuses?per_page=1`,
  );
  if (statuses.length === 0) return null;
  return { state: statuses[0].state, url: statuses[0].environment_url };
}

// ─── Compare ──────────────────────────────────────────────────────────────────

interface GitHubCompare {
  behind_by: number;
  ahead_by: number;
}

export async function compareBranches(
  base: string,
  head: string,
): Promise<{ behindBy: number; aheadBy: number }> {
  const data = await githubFetch<GitHubCompare>(`/compare/${base}...${head}`);
  return { behindBy: data.behind_by, aheadBy: data.ahead_by };
}
