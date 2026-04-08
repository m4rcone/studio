"use client";

import { useReducer, useCallback } from "react";
import { useStreamingResponse } from "./useStreamingResponse";
import type { StreamEvent, FileDiff } from "@/lib/studio/types";

export interface UIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  proposalId?: string;
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
  | { type: "STOP_STREAMING" }
  | { type: "SET_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

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
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          proposalId: action.proposalId,
          diffs: action.diffs,
          proposalSummary: action.summary,
        };
      }
      return { ...state, messages: msgs };
    }
    case "STOP_STREAMING":
      return { ...state, isStreaming: false };
    case "SET_ERROR":
      return { ...state, error: action.error, isStreaming: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useChat(sessionId: string | null) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isStreaming: false,
    error: null,
  });

  const { stream, abort } = useStreamingResponse();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || state.isStreaming) return;

      const userMsg: UIChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      dispatch({ type: "ADD_USER_MESSAGE", message: userMsg });
      dispatch({ type: "START_STREAMING" });

      try {
        const eventStream = stream(`/api/studio/sessions/${sessionId}/chat`, {
          message: content,
          idempotencyKey: userMsg.id,
        });

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

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
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
