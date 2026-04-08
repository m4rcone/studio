import type { ContentOperation } from "./types";

/**
 * Resolve a dotted path with array selectors into a nested object.
 * Supports: "sections[id=main-hero].data.headline"
 *
 * Returns { parent, key, value } where parent[key] === value.
 */
export function resolvePath(
  obj: Record<string, unknown>,
  path: string,
): { parent: Record<string, unknown>; key: string; value: unknown } | null {
  const segments = parsePath(path);
  let current: unknown = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    current = navigateSegment(current, seg);
    if (current === undefined || current === null) return null;
  }

  const lastSeg = segments[segments.length - 1];
  if (lastSeg.type === "key") {
    const parent = current as Record<string, unknown>;
    return { parent, key: lastSeg.name, value: parent[lastSeg.name] };
  }

  // Last segment is an array selector — return the matched item
  if (lastSeg.type === "arraySelector") {
    const arr = (current as Record<string, unknown>)[
      lastSeg.arrayField
    ] as unknown[];
    if (!Array.isArray(arr)) return null;
    const idx = arr.findIndex(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item as Record<string, unknown>)[lastSeg.matchKey] ===
          lastSeg.matchValue,
    );
    if (idx === -1) return null;
    return {
      parent: current as Record<string, unknown>,
      key: String(idx),
      value: arr[idx],
    };
  }

  return null;
}

interface PathSegmentKey {
  type: "key";
  name: string;
}

interface PathSegmentArraySelector {
  type: "arraySelector";
  arrayField: string;
  matchKey: string;
  matchValue: string;
}

type PathSegment = PathSegmentKey | PathSegmentArraySelector;

/**
 * Parse a path string like "sections[id=main-hero].data.headline"
 * into an array of segments.
 */
function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const regex = /([a-zA-Z_$][\w$-]*)(?:\[(\w+)=([^\]]+)\])?/g;
  let match: RegExpExecArray | null;

  // Split by dots, but handle bracket notation
  const parts = path.split(".");

  for (const part of parts) {
    regex.lastIndex = 0;
    match = regex.exec(part);
    if (match) {
      const [, fieldName, matchKey, matchValue] = match;
      if (matchKey && matchValue) {
        segments.push({
          type: "arraySelector",
          arrayField: fieldName,
          matchKey,
          matchValue,
        });
      } else {
        segments.push({ type: "key", name: fieldName });
      }
    }
  }

  return segments;
}

function navigateSegment(obj: unknown, segment: PathSegment): unknown {
  if (obj === null || obj === undefined || typeof obj !== "object")
    return undefined;

  if (segment.type === "key") {
    return (obj as Record<string, unknown>)[segment.name];
  }

  if (segment.type === "arraySelector") {
    const arr = (obj as Record<string, unknown>)[segment.arrayField];
    if (!Array.isArray(arr)) return undefined;
    return arr.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item as Record<string, unknown>)[segment.matchKey] ===
          segment.matchValue,
    );
  }

  return undefined;
}

/**
 * Apply a single operation to a parsed JSON object. Returns the mutated object.
 */
export function applyOperation(
  data: Record<string, unknown>,
  op: ContentOperation,
): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(data));

  switch (op.op) {
    case "update_field": {
      const resolved = resolvePath(clone, op.path);
      if (!resolved) throw new Error(`Path not found: ${op.path}`);
      resolved.parent[resolved.key] = op.value;
      break;
    }
    case "insert_item": {
      const parentPath = op.path;
      const resolved = resolvePath(clone, parentPath);
      if (!resolved) throw new Error(`Path not found: ${parentPath}`);
      const arr = resolved.parent[resolved.key];
      if (!Array.isArray(arr))
        throw new Error(`Target is not an array: ${parentPath}`);
      const index = op.index ?? arr.length;
      arr.splice(index, 0, op.item);
      break;
    }
    case "remove_item": {
      const resolved = resolvePath(clone, op.path);
      if (!resolved) throw new Error(`Path not found: ${op.path}`);
      const arr = resolved.parent[resolved.key];
      if (!Array.isArray(arr))
        throw new Error(`Target is not an array: ${op.path}`);
      if (op.index < 0 || op.index >= arr.length)
        throw new Error(`Index out of bounds: ${op.index}`);
      arr.splice(op.index, 1);
      break;
    }
    case "reorder": {
      const resolved = resolvePath(clone, op.path);
      if (!resolved) throw new Error(`Path not found: ${op.path}`);
      const arr = resolved.parent[resolved.key];
      if (!Array.isArray(arr))
        throw new Error(`Target is not an array: ${op.path}`);
      const reordered = op.order.map((i) => {
        if (i < 0 || i >= arr.length)
          throw new Error(`Reorder index out of bounds: ${i}`);
        return arr[i];
      });
      resolved.parent[resolved.key] = reordered;
      break;
    }
  }

  return clone;
}
