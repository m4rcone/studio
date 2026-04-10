import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "./env";
import { buildSystemPrompt } from "./prompt";
import { TOOL_DEFINITIONS, executeTool } from "./tools";
import { AGENT_LIMITS, checkLimits } from "./agent-guard";
import type { StudioSession, StreamEvent } from "./types";

type AnthropicMessage = Anthropic.Messages.MessageParam;

/**
 * Run the agent loop with streaming.
 * Yields StreamEvents that the SSE endpoint forwards to the client.
 */
export async function* runAgent(
  userMessage: string,
  chatHistory: AnthropicMessage[],
  session: StudioSession,
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const env = getEnv();
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const systemPrompt = await buildSystemPrompt(session, userMessage);

  const messages: AnthropicMessage[] = [
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  let iterations = 0;
  let proposalFailures = 0;
  let proposalCreated = false;
  let missingProposalRetryUsed = false;
  const startTime = Date.now();
  const proposalRequired = requestNeedsProposal(userMessage);

  while (true) {
    const check = checkLimits(iterations, startTime, signal);
    if (!check.ok) {
      yield { type: "error", message: check.reason };
      break;
    }

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: AGENT_LIMITS.maxTokensPerTurn,
      system: systemPrompt,
      messages,
      tools: TOOL_DEFINITIONS,
    });

    // Stream text deltas to the client
    for await (const event of stream) {
      if (signal.aborted) {
        stream.abort();
        break;
      }

      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text_delta", text: event.delta.text };
      }
    }

    if (signal.aborted) break;

    const finalMessage = await stream.finalMessage();
    messages.push({ role: "assistant", content: finalMessage.content });

    if (finalMessage.stop_reason === "tool_use") {
      const toolUseBlocks = finalMessage.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use",
      );

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        yield {
          type: "tool_use",
          tool: toolUse.name,
          input: toolUse.input as Record<string, unknown>,
        };

        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          session,
        );

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });

        try {
          const parsed = JSON.parse(result) as { error?: string };
          if (typeof parsed.error === "string" && parsed.error.length > 0) {
            if (toolUse.name === "propose_changes") {
              proposalFailures += 1;
            }

            yield {
              type: "error",
              message: `${toolUse.name}: ${parsed.error}`,
            };

            if (toolUse.name === "propose_changes" && proposalFailures >= 2) {
              yield {
                type: "error",
                message:
                  "Stopping after repeated proposal errors. Explain the constraint or ask the user to refine the request instead of retrying again.",
              };
              yield { type: "done" };
              return;
            }
          }
        } catch {
          // Ignore non-JSON tool output
        }

        // Check if this was a propose_changes call
        if (toolUse.name === "propose_changes") {
          try {
            const parsed = JSON.parse(result);
            if (parsed.proposalId) {
              proposalFailures = 0;
              proposalCreated = true;
              yield {
                type: "proposal_created",
                proposalId: parsed.proposalId,
                summary: parsed.summary,
                diffs: parsed.diffs,
              };
            }
          } catch {
            // Not a valid proposal result
          }
        }
      }

      messages.push({ role: "user", content: toolResults });
      iterations++;
    } else {
      if (proposalRequired && !proposalCreated && !missingProposalRetryUsed) {
        missingProposalRetryUsed = true;
        messages.push({
          role: "user",
          content:
            "This is an actionable content edit request. Do not end the turn with only commentary, a plan, or a summary. Read any needed content or schema files and either create a proposal with propose_changes or clearly explain the concrete blocking limitation. Never tell the user a change is ready to approve unless propose_changes succeeded.",
        });
        iterations++;
        continue;
      }

      if (proposalRequired && !proposalCreated) {
        yield {
          type: "error",
          message:
            "This edit request ended without a structured proposal. Create a proposal with diffs, or explain the blocking limitation instead of stopping with a summary.",
        };
      }

      // End turn — no more tool calls
      break;
    }
  }

  yield { type: "done" };
}

function requestNeedsProposal(message: string): boolean {
  const normalized = normalizeForIntentDetection(message);

  const editSignals = [
    "change",
    "update",
    "edit",
    "rewrite",
    "replace",
    "move",
    "reorder",
    "swap",
    "put",
    "place",
    "make ",
    "remove",
    "delete",
    "add ",
    "shorten",
    "fix ",
    "rename",
    "rearrange",
    "insert",
    "before",
    "after",
    "mude",
    "altere",
    "edite",
    "reescreva",
    "substitua",
    "troque",
    "coloque",
    "ponha",
    "faca ",
    "faça ",
    "remova",
    "apague",
    "adicione",
    "encurte",
    "corrija",
    "renomeie",
    "reordene",
    "reorganize",
    "antes de",
    "depois de",
  ];

  return editSignals.some((signal) => normalized.includes(signal));
}

function normalizeForIntentDetection(message: string): string {
  return message
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
