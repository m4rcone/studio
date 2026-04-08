export interface StudioSession {
  id: string;
  userId: string;
  role: "client" | "team";
  status: "active" | "approved" | "discarded";
  branch: string | null;
  prNumber: number | null;
  prUrl: string | null;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
  title: string;
  changedFiles: string[];
  commitCount: number;
}

export interface PendingProposal {
  id: string;
  sessionId: string;
  operations: ContentOperation[];
  summary: string;
  affectedFiles: string[];
  diffs: FileDiff[];
  createdAt: string;
  status: "pending" | "applied" | "rejected" | "expired";
}

export type ContentOperation =
  | { op: "update_field"; file: string; path: string; value: unknown }
  | {
      op: "insert_item";
      file: string;
      path: string;
      item: unknown;
      index?: number;
    }
  | { op: "remove_item"; file: string; path: string; index: number }
  | { op: "reorder"; file: string; path: string; order: number[] };

export interface FileDiff {
  file: string;
  path: string;
  before: unknown;
  after: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  proposalId?: string;
}

export interface AuthPayload {
  sub: string;
  role: "client" | "team";
  iat: number;
  exp: number;
}

export type StreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_use"; tool: string; input: Record<string, unknown> }
  | {
      type: "proposal_created";
      proposalId: string;
      summary: string;
      diffs: FileDiff[];
    }
  | { type: "error"; message: string }
  | { type: "done" };
