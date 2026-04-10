import type { ContentOperation } from "./types";

const CONTENT_DIR = "content/";
const DESIGN_TOKEN_PATHS = [
  "theme.colors",
  "theme.fonts",
  "theme.borderRadius",
];
const TEAM_ONLY_FILE_PATTERNS = [/^media\/manifest\.json$/];
const BASE_ALLOWED_FILE_PATTERNS = [
  /^pages\/.+\.data\.json$/,
  /^site\.config\.json$/,
  /^navigation\.json$/,
];

/**
 * Programmatic enforcement of permissions per role.
 * This is the REAL security layer — not dependent on the AI prompt.
 */
export function assertOperationAllowed(
  op: ContentOperation,
  role: "client" | "team",
): void {
  const file = normalizeFile(op.file);

  if (
    !matchesAny(BASE_ALLOWED_FILE_PATTERNS, file) &&
    !matchesAny(TEAM_ONLY_FILE_PATTERNS, file)
  ) {
    throw new PermissionError(
      `Access denied: file "${op.file}" is outside content scope`,
    );
  }

  if (op.file.includes("..") || op.path.includes("..")) {
    throw new PermissionError("Path traversal is not allowed");
  }

  if (op.op === "update_field" && isStructuredValue(op.value)) {
    throw new PermissionError(
      "update_field must target a single text/number/boolean/null field. Use insert_item, remove_item, reorder, or multiple field-level update_field operations for arrays and objects.",
    );
  }

  if (role === "client") {
    if (matchesAny(TEAM_ONLY_FILE_PATTERNS, file)) {
      throw new PermissionError(`Clients cannot edit "${op.file}"`);
    }

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

function isStructuredValue(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

function matchesAny(patterns: RegExp[], value: string): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}
