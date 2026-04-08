import type { ContentOperation } from "./types";

const CONTENT_DIR = "content/";
const ALLOWED_PREFIXES = [
  "pages/",
  "site.config.json",
  "navigation.json",
  "media/manifest.json",
];

// Fields in site.config.json that only "team" can edit (design tokens)
const DESIGN_TOKEN_PATHS = [
  "theme.colors",
  "theme.fonts",
  "theme.borderRadius",
];

/**
 * Programmatic enforcement of permissions per role.
 * This is the REAL security layer — not dependent on the AI prompt.
 */
export function assertOperationAllowed(
  op: ContentOperation,
  role: "client" | "team",
): void {
  // 1. Only content/ files are allowed
  const file = normalizeFile(op.file);
  if (
    !ALLOWED_PREFIXES.some(
      (prefix) => file.startsWith(prefix) || file === prefix,
    )
  ) {
    throw new PermissionError(
      `Access denied: file "${op.file}" is outside content scope`,
    );
  }

  // 2. Path traversal check
  if (op.file.includes("..") || op.path.includes("..")) {
    throw new PermissionError("Path traversal is not allowed");
  }

  // 3. Client-specific restrictions
  if (role === "client") {
    // Clients cannot create new files (new pages)
    if (op.op === "insert_item" && isNewFilePath(op.path)) {
      throw new PermissionError("Clients cannot create new pages");
    }

    // Clients cannot edit design tokens in site.config.json
    if (file === "site.config.json") {
      for (const tokenPath of DESIGN_TOKEN_PATHS) {
        if (op.path.startsWith(tokenPath)) {
          throw new PermissionError(
            `Clients cannot edit design tokens (${tokenPath})`,
          );
        }
      }
    }
  }
}

/**
 * Normalize file path: strip leading "content/" if present.
 */
function normalizeFile(file: string): string {
  return file.startsWith(CONTENT_DIR) ? file.slice(CONTENT_DIR.length) : file;
}

function isNewFilePath(path: string): boolean {
  // Very basic heuristic — creating a new file would mean the path
  // doesn't resolve to an existing field
  return path === "" || path === "/";
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}
