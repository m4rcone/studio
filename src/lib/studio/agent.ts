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
  const systemPrompt = await buildSystemPrompt(session);

  const messages: AnthropicMessage[] = [
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  let iterations = 0;
  const startTime = Date.now();

  while (true) {
    const check = checkLimits(iterations, startTime, signal);
    if (!check.ok) {
      yield { type: "error", message: check.reason };
      break;
    }

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
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

        // Check if this was a propose_changes call
        if (toolUse.name === "propose_changes") {
          try {
            const parsed = JSON.parse(result);
            if (parsed.proposalId) {
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
      // End turn — no more tool calls
      break;
    }
  }

  yield { type: "done" };
}
