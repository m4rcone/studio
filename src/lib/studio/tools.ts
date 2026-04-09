import type Anthropic from "@anthropic-ai/sdk";
import { getContentProvider } from "./content-provider";
import { createProposal } from "./proposal";
import type { StudioSession, ContentOperation } from "./types";

// Allowlist: content data, AI docs, and Studio schemas
const READABLE_PATH_PREFIXES = ["content/", "ai/", "src/lib/studio/schemas/"];

function isAllowedPath(path: string): boolean {
  if (path.includes("..")) return false;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return READABLE_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function normalizePath(path: string): string {
  // Bare content paths resolve into content/ for convenience.
  if (
    !path.startsWith("content/") &&
    !path.startsWith("ai/") &&
    !path.startsWith("src/lib/studio/schemas/")
  ) {
    return `content/${path}`;
  }
  return path;
}

export const TOOL_DEFINITIONS: Anthropic.Messages.Tool[] = [
  {
    name: "read_content_file",
    description:
      "Read content data, AI editing docs, or Studio Zod schemas. Bare paths resolve to content/ (e.g. 'pages/home.data.json', 'site.config.json', 'media/manifest.json'). Can also read 'ai/CONVENTIONS.md', 'ai/EDITING_GUIDE.md', 'src/lib/studio/schemas/site-config.schema.ts', and 'src/lib/studio/schemas/sections/testimonials.schema.ts'. Read the relevant schema before insert_item, remove_item, or any structural proposal.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description:
            "File path relative to project root. Bare paths resolve to content/. Allowed roots: content/, ai/, src/lib/studio/schemas/",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_content_files",
    description:
      "List all files in the content/ directory and subdirectories. Use read_content_file for AI docs in ai/ and Studio Zod schemas in src/lib/studio/schemas/.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "search_content",
    description:
      "Search for text across all content files (case-insensitive). Returns up to 10 results with file path and matching line.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Text to search for" },
      },
      required: ["query"],
    },
  },
  {
    name: "propose_changes",
    description:
      "Propose content changes for user approval. Creates a structured proposal with diffs. The user must explicitly approve via the UI before changes are applied. Paths must use Studio path syntax such as sections[id=client-testimonials].data.items or items[2]; never use dot-number paths like sections.3.data.items. For insert_item, send the full new object in operations[].item. For remove_item, path must point to the array field itself and index must be the numeric position inside that array.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "Human-readable summary of the changes in English.",
        },
        operations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              op: {
                type: "string",
                enum: ["update_field", "insert_item", "remove_item", "reorder"],
              },
              file: {
                type: "string",
                description: "Path relative to content/",
              },
              path: {
                type: "string",
                description:
                  "Field path. Ex: sections[id=main-hero].data.headline. For remove_item and reorder, path must point to the array field itself, such as sections[id=client-testimonials].data.items.",
              },
              value: {
                description:
                  "New primitive value for update_field. Do not pass objects or arrays; use insert_item, remove_item, reorder, or multiple field-level updates instead.",
              },
              item: {
                type: "object",
                description:
                  "Complete object to insert for insert_item. Read the matching schema first and include every required field with the correct shape.",
                additionalProperties: true,
              },
              index: {
                type: "integer",
                description:
                  "Position for insert/remove. Required for remove_item. Example: to remove Paula from the third testimonial, use path sections[id=client-testimonials].data.items and index 2.",
              },
              order: {
                type: "array",
                items: { type: "integer" },
                description: "New order for reorder",
              },
            },
            required: ["op", "file", "path"],
          },
        },
      },
      required: ["summary", "operations"],
    },
  },
  {
    name: "get_session_status",
    description:
      "Get the current session status including branch, PR URL, preview URL, and list of changes.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
];

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  session: StudioSession,
): Promise<string> {
  switch (toolName) {
    case "read_content_file":
      return executeReadContentFile(input.path as string, session);
    case "list_content_files":
      return executeListContentFiles(session);
    case "search_content":
      return executeSearchContent(input.query as string, session);
    case "propose_changes":
      return executeProposeChanges(
        session,
        input.summary as string,
        input.operations as ContentOperation[],
      );
    case "get_session_status":
      return executeGetSessionStatus(session);
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

async function executeReadContentFile(
  path: string,
  session: StudioSession,
): Promise<string> {
  const normalized = normalizePath(path);
  if (!isAllowedPath(normalized)) {
    return JSON.stringify({ error: `Access denied: ${path}` });
  }
  try {
    const provider = await getContentProvider();
    const content = normalized.startsWith("content/")
      ? await provider.readFile(normalized, session.branch ?? undefined)
      : await provider.readTextFile(normalized);
    return content;
  } catch (err) {
    return JSON.stringify({
      error: `Failed to read ${path}: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

async function executeListContentFiles(
  session: StudioSession,
): Promise<string> {
  try {
    const provider = await getContentProvider();
    const files = await provider.listFiles(
      "content",
      session.branch ?? undefined,
    );
    return JSON.stringify({ files });
  } catch (err) {
    return JSON.stringify({
      error: `Failed to list files: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

async function executeSearchContent(
  query: string,
  session: StudioSession,
): Promise<string> {
  try {
    const provider = await getContentProvider();
    const files = await provider.listFiles(
      "content",
      session.branch ?? undefined,
    );
    const results: Array<{ file: string; matches: string[] }> = [];
    const lowerQuery = query.toLowerCase();

    for (const file of files) {
      if (results.length >= 10) break;
      try {
        const content = await provider.readFile(
          file,
          session.branch ?? undefined,
        );
        const lines = content.split("\n");
        const matches = lines
          .filter((line) => line.toLowerCase().includes(lowerQuery))
          .slice(0, 3);
        if (matches.length > 0) {
          results.push({ file, matches });
        }
      } catch {
        // Skip unreadable files
      }
    }

    return JSON.stringify({ results, total: results.length });
  } catch (err) {
    return JSON.stringify({
      error: `Search failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

async function executeProposeChanges(
  session: StudioSession,
  summary: string,
  operations: ContentOperation[],
): Promise<string> {
  try {
    for (const op of operations) {
      if (hasDotNumberPath(op.path)) {
        return JSON.stringify({
          error:
            "Proposal failed: path uses unsupported dot-number syntax. Use Studio path syntax with selectors or brackets, such as sections[id=client-testimonials].data.items or items[2], never sections.3.data.items.",
        });
      }

      if (op.op === "insert_item" && op.item === undefined) {
        return JSON.stringify({
          error:
            "Proposal failed: insert_item requires an item object. Read the matching schema and send the complete object in operations[].item.",
        });
      }

      if (op.op === "remove_item") {
        if (typeof op.index !== "number") {
          return JSON.stringify({
            error:
              "Proposal failed: remove_item requires a numeric index. Read the current array, find the item's position, and send it in operations[].index.",
          });
        }

        if (hasItemSelectorPath(op.path)) {
          return JSON.stringify({
            error:
              "Proposal failed: remove_item path must point to the array field, not an item selector. Use a path like sections[id=client-testimonials].data.items plus the item's numeric index.",
          });
        }
      }
    }

    const proposal = await createProposal(
      session.id,
      session.role,
      summary,
      operations,
      session.branch,
    );
    return JSON.stringify({
      proposalId: proposal.id,
      summary: proposal.summary,
      diffs: proposal.diffs,
      affectedFiles: proposal.affectedFiles,
    });
  } catch (err) {
    return JSON.stringify({
      error: `Proposal failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

function hasDotNumberPath(path: string): boolean {
  return /(^|\.)\d+(\.|$)/.test(path);
}

function hasItemSelectorPath(path: string): boolean {
  const segments = path.split(".");
  const lastSegment = segments[segments.length - 1] ?? "";
  return /\[[a-zA-Z_$][\w$-]*=/.test(lastSegment);
}

async function executeGetSessionStatus(
  session: StudioSession,
): Promise<string> {
  return JSON.stringify({
    id: session.id,
    status: session.status,
    branch: session.branch,
    prUrl: session.prUrl,
    previewUrl: session.previewUrl,
    latestCommitSha: session.latestCommitSha ?? null,
    changedFiles: session.changedFiles,
    commitCount: session.commitCount,
  });
}
