import { getContentProvider } from "./content-provider";
import { applyOperation } from "./operations";
import * as github from "./github";
import { getEnv } from "./env";
import type { PendingProposal, StudioSession } from "./types";

/**
 * Apply a confirmed proposal: mutate files, create branch/PR if needed, commit.
 */
export async function applyProposal(
  proposal: PendingProposal,
  session: StudioSession,
): Promise<{ sha: string; branch: string; prNumber: number; prUrl: string }> {
  const provider = await getContentProvider();

  // Group operations by file
  const fileOps = new Map<string, typeof proposal.operations>();
  for (const op of proposal.operations) {
    const file = normalizeContentPath(op.file);
    const existing = fileOps.get(file) ?? [];
    existing.push(op);
    fileOps.set(file, existing);
  }

  // Apply operations to each file
  const fileChanges: Array<{ path: string; content: string }> = [];
  for (const [filePath, ops] of fileOps) {
    const content = await provider.readFile(filePath);
    let data = JSON.parse(content);

    for (const op of ops) {
      data = applyOperation(data, op);
    }

    fileChanges.push({
      path: filePath,
      content: JSON.stringify(data, null, 2) + "\n",
    });
  }

  // Create branch if this is the first applied proposal
  let branch = session.branch;
  let prNumber = session.prNumber;
  let prUrl = session.prUrl;

  if (!branch) {
    const env = getEnv();
    branch = generateBranchName();
    const mainSha = await github.getRef(env.GITHUB_DEFAULT_BRANCH);
    await github.createBranch(branch, mainSha);
  }

  // Commit changes before creating PR (GitHub rejects PRs with no commits ahead of base)
  const sha = await provider.writeFiles(
    fileChanges,
    `studio: ${proposal.summary}`,
    branch,
  );

  if (!prNumber) {
    // Create PR after committing so the branch has at least one commit ahead of main
    const pr = await github.createPullRequest(
      `[Studio] ${session.title || proposal.summary}`,
      buildPRBody(session, proposal),
      branch,
    );
    prNumber = pr.number;
    prUrl = pr.url;
  }

  return {
    sha: sha.sha,
    branch,
    prNumber: prNumber!,
    prUrl: prUrl!,
  };
}

function generateBranchName(): string {
  const date = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 6);
  return `studio/edit-${date}-${rand}`;
}

function buildPRBody(
  session: StudioSession,
  proposal: PendingProposal,
): string {
  return [
    "## Edições de Conteúdo",
    "",
    `- ${proposal.summary}`,
    "",
    `<!-- studio-meta:${JSON.stringify({ sessionId: session.id, userId: session.userId })} -->`,
  ].join("\n");
}

function normalizeContentPath(file: string): string {
  return file.startsWith("content/") ? file : `content/${file}`;
}
