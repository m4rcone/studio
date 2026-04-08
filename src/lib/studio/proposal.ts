import { getRedis, proposalKey } from "./store";
import { getContentProvider } from "./content-provider";
import { resolvePath, applyOperation } from "./operations";
import { assertOperationAllowed } from "./permissions";
import { getSectionSchema, getSchemaForFile } from "./schemas";
import type { ContentOperation, PendingProposal, FileDiff } from "./types";

const PROPOSAL_TTL = 3600; // 1 hour

/**
 * Create a validated proposal from a list of operations.
 * Returns the proposal with diffs, or throws with validation errors.
 */
export async function createProposal(
  sessionId: string,
  role: "client" | "team",
  summary: string,
  operations: ContentOperation[],
): Promise<PendingProposal> {
  const provider = await getContentProvider();
  const diffs: FileDiff[] = [];
  const affectedFiles = new Set<string>();

  // Validate each operation
  for (const op of operations) {
    // 1. Permission check
    assertOperationAllowed(op, role);

    // 2. Read current file content
    const filePath = normalizeContentPath(op.file);
    const content = await provider.readFile(filePath);
    const data = JSON.parse(content);

    // 3. Resolve path and capture "before" value
    const resolved = resolvePath(data, op.path);
    if (!resolved && op.op !== "insert_item") {
      throw new Error(`Path not found: ${op.path} in ${op.file}`);
    }

    const before = resolved?.value;

    // 4. Apply operation to get "after" state
    const afterData = applyOperation(data, op);
    const afterResolved = resolvePath(afterData, op.path);
    const after = op.op === "update_field" ? op.value : afterResolved?.value;

    // 5. Validate against Zod schema if available
    validateAgainstSchema(op.file, afterData, op.path);

    diffs.push({
      file: op.file,
      path: op.path,
      before,
      after,
    });

    affectedFiles.add(op.file);
  }

  // Create proposal
  const proposal: PendingProposal = {
    id: `p-${crypto.randomUUID().slice(0, 8)}`,
    sessionId,
    operations,
    summary,
    affectedFiles: Array.from(affectedFiles),
    diffs,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  // Persist to Redis
  const redis = getRedis();
  await redis.set(proposalKey(sessionId), JSON.stringify(proposal), {
    ex: PROPOSAL_TTL,
  });

  return proposal;
}

/**
 * Get a pending proposal for a session.
 */
export async function getProposal(
  sessionId: string,
): Promise<PendingProposal | null> {
  const redis = getRedis();
  const data = await redis.get(proposalKey(sessionId));
  if (!data) return null;
  return typeof data === "string"
    ? JSON.parse(data)
    : (data as PendingProposal);
}

/**
 * Update proposal status in Redis.
 */
export async function updateProposalStatus(
  sessionId: string,
  status: PendingProposal["status"],
): Promise<void> {
  const proposal = await getProposal(sessionId);
  if (!proposal) return;
  proposal.status = status;
  const redis = getRedis();
  await redis.set(proposalKey(sessionId), JSON.stringify(proposal), {
    ex: PROPOSAL_TTL,
  });
}

function normalizeContentPath(file: string): string {
  return file.startsWith("content/") ? file : `content/${file}`;
}

/**
 * Validate the entire file or section data against Zod schemas.
 */
function validateAgainstSchema(
  file: string,
  data: Record<string, unknown>,
  path: string,
): void {
  const normalizedFile = file.startsWith("content/") ? file.slice(8) : file;

  // File-level validation
  const fileSchema = getSchemaForFile(normalizedFile);
  if (fileSchema) {
    const result = fileSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      );
      throw new Error(`Validation failed:\n${issues.join("\n")}`);
    }
  }

  // Section-level validation for page data files
  if (normalizedFile.match(/^pages\/.*\.data\.json$/)) {
    const sectionMatch = path.match(/^sections\[id=([^\]]+)\]/);
    if (sectionMatch && data.sections) {
      const sections = data.sections as Array<{
        id: string;
        type: string;
        data: unknown;
      }>;
      const section = sections.find((s) => s.id === sectionMatch[1]);
      if (section) {
        const sectionSchema = getSectionSchema(section.type);
        if (sectionSchema) {
          const result = sectionSchema.safeParse(section.data);
          if (!result.success) {
            const issues = result.error.issues.map(
              (i) => `${i.path.join(".")}: ${i.message}`,
            );
            throw new Error(
              `Section "${section.id}" validation failed:\n${issues.join("\n")}`,
            );
          }
        }
      }
    }
  }
}
