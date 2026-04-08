import type Anthropic from "@anthropic-ai/sdk";
import { getContentProvider } from "./content-provider";
import { createProposal } from "./proposal";
import type { StudioSession, ContentOperation } from "./types";

// Allowlist: only content/ and ai/ files
const ALLOWED_PATH_PREFIXES = ["content/", "ai/"];

function isAllowedPath(path: string): boolean {
  if (path.includes("..")) return false;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return ALLOWED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function normalizePath(path: string): string {
  // If path doesn't start with content/ or ai/, prepend content/
  if (!path.startsWith("content/") && !path.startsWith("ai/")) {
    return `content/${path}`;
  }
  return path;
}

export const TOOL_DEFINITIONS: Anthropic.Messages.Tool[] = [
  {
    name: "read_content_file",
    description:
      "Read a content file. Paths relative to content/ (e.g. 'pages/home.data.json', 'site.config.json'). Can also read 'ai/CONVENTIONS.md' and 'ai/EDITING_GUIDE.md'.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "File path relative to project root or content/",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_content_files",
    description: "List all files in the content/ directory.",
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
      "Propose content changes for user approval. Creates a structured proposal with diffs. The user must explicitly approve via the UI before changes are applied.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: {
          type: "string",
          description: "Human-readable summary of the changes in Portuguese.",
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
                  "Field path. Ex: sections[id=main-hero].data.headline",
              },
              value: {
                description:
                  "New value (update_field) or new item (insert_item)",
              },
              index: {
                type: "integer",
                description: "Position for insert/remove",
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
      return executeReadContentFile(input.path as string);
    case "list_content_files":
      return executeListContentFiles();
    case "search_content":
      return executeSearchContent(input.query as string);
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

async function executeReadContentFile(path: string): Promise<string> {
  const normalized = normalizePath(path);
  if (!isAllowedPath(normalized)) {
    return JSON.stringify({ error: `Access denied: ${path}` });
  }
  try {
    const provider = await getContentProvider();
    const content = await provider.readTextFile(normalized);
    return content;
  } catch (err) {
    return JSON.stringify({
      error: `Failed to read ${path}: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

async function executeListContentFiles(): Promise<string> {
  try {
    const provider = await getContentProvider();
    const files = await provider.listFiles("content");
    return JSON.stringify({ files });
  } catch (err) {
    return JSON.stringify({
      error: `Failed to list files: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}

async function executeSearchContent(query: string): Promise<string> {
  try {
    const provider = await getContentProvider();
    const files = await provider.listFiles("content");
    const results: Array<{ file: string; matches: string[] }> = [];
    const lowerQuery = query.toLowerCase();

    for (const file of files) {
      if (results.length >= 10) break;
      try {
        const content = await provider.readTextFile(file);
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
    const proposal = await createProposal(
      session.id,
      session.role,
      summary,
      operations,
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

async function executeGetSessionStatus(
  session: StudioSession,
): Promise<string> {
  return JSON.stringify({
    id: session.id,
    status: session.status,
    branch: session.branch,
    prUrl: session.prUrl,
    previewUrl: session.previewUrl,
    changedFiles: session.changedFiles,
    commitCount: session.commitCount,
  });
}
