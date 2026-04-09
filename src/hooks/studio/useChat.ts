"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { useStreamingResponse } from "./useStreamingResponse";
import type { StreamEvent, FileDiff } from "@/lib/studio/types";

export type ProposalUiState =
  | "pending"
  | "applying"
  | "applied"
  | "rejecting"
  | "rejected"
  | "superseded";

export interface UIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  proposalId?: string;
  proposalState?: ProposalUiState;
  diffs?: FileDiff[];
  proposalSummary?: string;
}

interface ChatState {
  messages: UIChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

type ChatAction =
  | { type: "ADD_USER_MESSAGE"; message: UIChatMessage }
  | { type: "START_STREAMING" }
  | { type: "APPEND_TEXT"; text: string }
  | {
      type: "SET_PROPOSAL";
      proposalId: string;
      summary: string;
      diffs: FileDiff[];
    }
  | {
      type: "SET_PROPOSAL_STATE";
      proposalId: string;
      proposalState: ProposalUiState;
    }
  | { type: "SUPERSEDE_PENDING_PROPOSALS" }
  | { type: "STOP_STREAMING" }
  | { type: "SET_ERROR"; error: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_MESSAGES"; messages: UIChatMessage[] }
  | { type: "RESET" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
        error: null,
      };
    case "START_STREAMING": {
      const assistantMsg: UIChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      return {
        ...state,
        messages: [...state.messages, assistantMsg],
        isStreaming: true,
      };
    }
    case "APPEND_TEXT": {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content + action.text,
        };
      }
      return { ...state, messages: msgs };
    }
    case "SET_PROPOSAL": {
      const msgs = state.messages.map((message) =>
        message.proposalId && message.proposalState === "pending"
          ? { ...message, proposalState: "superseded" as const }
          : message,
      );
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          proposalId: action.proposalId,
          proposalState: "pending",
          diffs: action.diffs,
          proposalSummary: action.summary,
        };
      }
      return { ...state, messages: msgs };
    }
    case "SET_PROPOSAL_STATE":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.proposalId === action.proposalId
            ? { ...message, proposalState: action.proposalState }
            : message,
        ),
      };
    case "SUPERSEDE_PENDING_PROPOSALS":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.proposalId && message.proposalState === "pending"
            ? { ...message, proposalState: "superseded" as const }
            : message,
        ),
      };
    case "STOP_STREAMING":
      return { ...state, isStreaming: false };
    case "SET_ERROR":
      return { ...state, error: action.error, isStreaming: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "RESET":
      return { messages: [], isStreaming: false, error: null };
    default:
      return state;
  }
}

// ─── localStorage helpers ────────────────────────────────────────────────────

const messagesKey = (sessionId: string) => `studio_messages_${sessionId}`;

function loadMessages(sessionId: string): UIChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(messagesKey(sessionId));
    return raw
      ? normalizeLoadedMessages(JSON.parse(raw) as UIChatMessage[])
      : [];
  } catch {
    return [];
  }
}

function saveMessages(sessionId: string, messages: UIChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(messagesKey(sessionId), JSON.stringify(messages));
  } catch {
    // Ignore quota errors
  }
}

export function clearChatHistory(sessionId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(messagesKey(sessionId));
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChat(sessionId: string | null) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isStreaming: false,
    error: null,
  });

  const { stream, abort } = useStreamingResponse();

  const setProposalState = useCallback(
    (proposalId: string, proposalState: ProposalUiState) => {
      dispatch({ type: "SET_PROPOSAL_STATE", proposalId, proposalState });
    },
    [],
  );

  // Reset and reload messages when sessionId changes
  const prevSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevSessionIdRef.current === sessionId) return;
    prevSessionIdRef.current = sessionId;

    dispatch({ type: "RESET" });

    if (sessionId) {
      const saved = loadMessages(sessionId);
      if (saved.length > 0) {
        dispatch({ type: "SET_MESSAGES", messages: saved });
      }
    }
  }, [sessionId]);

  // Persist messages to localStorage after each completed exchange (not while streaming)
  useEffect(() => {
    if (!sessionId || state.isStreaming || state.messages.length === 0) return;
    saveMessages(sessionId, state.messages);
  }, [sessionId, state.messages, state.isStreaming]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || state.isStreaming) return;

      dispatch({ type: "CLEAR_ERROR" });

      const userMsg: UIChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      dispatch({ type: "ADD_USER_MESSAGE", message: userMsg });
      dispatch({ type: "START_STREAMING" });

      try {
        const eventStream = stream(
          `/api/studio/sessions/${sessionId}/chat`,
          {
            message: content,
            idempotencyKey: userMsg.id,
          },
          {
            onOpen: () => {
              dispatch({ type: "SUPERSEDE_PENDING_PROPOSALS" });
            },
          },
        );

        for await (const event of eventStream) {
          handleStreamEvent(event, dispatch);
        }
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        dispatch({ type: "STOP_STREAMING" });
      }
    },
    [sessionId, state.isStreaming, stream],
  );

  const applyProposal = useCallback(
    async (proposalId: string) => {
      if (!sessionId || state.isStreaming) return false;

      dispatch({ type: "CLEAR_ERROR" });
      setProposalState(proposalId, "applying");

      try {
        const res = await fetch(
          `/api/studio/sessions/${sessionId}/proposals/${proposalId}/apply`,
          { method: "POST" },
        );

        if (res.ok) {
          setProposalState(proposalId, "applied");
          return true;
        }

        const body = await res.json().catch(() => ({}));
        const errorMessage =
          typeof body.error === "string"
            ? body.error
            : "Could not apply this change.";
        setProposalState(
          proposalId,
          resolveProposalFailureState(res.status, errorMessage, "pending"),
        );
        dispatch({ type: "SET_ERROR", error: errorMessage });
      } catch {
        setProposalState(proposalId, "pending");
        dispatch({
          type: "SET_ERROR",
          error: "Could not apply this change. Try again.",
        });
      }

      return false;
    },
    [sessionId, state.isStreaming, setProposalState],
  );

  const rejectProposal = useCallback(
    async (proposalId: string) => {
      if (!sessionId || state.isStreaming) return false;

      dispatch({ type: "CLEAR_ERROR" });
      setProposalState(proposalId, "rejecting");

      try {
        const res = await fetch(
          `/api/studio/sessions/${sessionId}/proposals/${proposalId}/reject`,
          { method: "POST" },
        );

        if (res.ok) {
          setProposalState(proposalId, "rejected");
          return true;
        }

        const body = await res.json().catch(() => ({}));
        const errorMessage =
          typeof body.error === "string"
            ? body.error
            : "Could not deny this change.";
        setProposalState(
          proposalId,
          resolveProposalFailureState(res.status, errorMessage, "pending"),
        );
        dispatch({ type: "SET_ERROR", error: errorMessage });
      } catch {
        setProposalState(proposalId, "pending");
        dispatch({
          type: "SET_ERROR",
          error: "Could not deny this change. Try again.",
        });
      }

      return false;
    },
    [sessionId, state.isStreaming, setProposalState],
  );

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    applyProposal,
    rejectProposal,
    abort,
  };
}

function handleStreamEvent(
  event: StreamEvent,
  dispatch: React.Dispatch<ChatAction>,
) {
  switch (event.type) {
    case "text_delta":
      dispatch({ type: "APPEND_TEXT", text: event.text });
      break;
    case "proposal_created":
      dispatch({
        type: "SET_PROPOSAL",
        proposalId: event.proposalId,
        summary: event.summary,
        diffs: event.diffs,
      });
      break;
    case "error":
      dispatch({ type: "SET_ERROR", error: event.message });
      break;
    case "done":
      dispatch({ type: "STOP_STREAMING" });
      break;
  }
}

function normalizeLoadedMessages(messages: UIChatMessage[]): UIChatMessage[] {
  const normalized = messages.map((message) => {
    if (!message.proposalId) return message;

    if (
      message.proposalState === "applying" ||
      message.proposalState === "rejecting"
    ) {
      return { ...message, proposalState: "pending" as const };
    }

    return message;
  });

  const latestOpenProposalIndex = normalized.reduce(
    (latestIndex, message, index) => {
      if (!message.proposalId) return latestIndex;
      if (!message.proposalState || message.proposalState === "pending") {
        return index;
      }
      return latestIndex;
    },
    -1,
  );

  return normalized.map((message, index) => {
    if (!message.proposalId) return message;

    if (!message.proposalState) {
      return {
        ...message,
        proposalState:
          index === latestOpenProposalIndex ? "pending" : "superseded",
      };
    }

    if (
      message.proposalState === "pending" &&
      index !== latestOpenProposalIndex
    ) {
      return { ...message, proposalState: "superseded" };
    }

    return message;
  });
}

function resolveProposalFailureState(
  statusCode: number,
  errorMessage: string,
  fallbackState: ProposalUiState,
): ProposalUiState {
  if (statusCode === 404) {
    return "superseded";
  }

  if (errorMessage.includes("Proposal is rejected")) {
    return "rejected";
  }

  if (errorMessage.includes("Proposal is applied")) {
    return "applied";
  }

  return fallbackState;
}
