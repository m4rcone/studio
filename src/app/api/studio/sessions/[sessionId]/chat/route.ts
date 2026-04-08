import { verifyAuth } from "@/lib/studio/auth";
import { getSession } from "@/lib/studio/session-store";
import { appendMessage, getMessages } from "@/lib/studio/session-store";
import { acquireLock, releaseLock } from "@/lib/studio/store";
import { runAgent } from "@/lib/studio/agent";
import type { ChatMessage } from "@/lib/studio/types";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAuth();
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session || session.userId !== auth.sub) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (session.status !== "active") {
      return new Response(JSON.stringify({ error: "Session is not active" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, idempotencyKey } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Acquire lock
    const locked = await acquireLock(sessionId);
    if (!locked) {
      return new Response(
        JSON.stringify({ error: "Session is being processed" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Save user message
    const userMsg: ChatMessage = {
      id: idempotencyKey || crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(sessionId, userMsg);

    // Get chat history for context
    const history = await getMessages(sessionId);
    const anthropicMessages = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Create SSE stream
    const abortController = new AbortController();
    request.signal.addEventListener("abort", () => abortController.abort());

    const encoder = new TextEncoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runAgent(
            message,
            anthropicMessages.slice(0, -1), // Exclude the message we just added
            session,
            abortController.signal,
          )) {
            if (event.type === "text_delta") {
              assistantContent += event.text;
            }

            const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Save assistant response
          if (assistantContent) {
            const assistantMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: assistantContent,
              timestamp: new Date().toISOString(),
            };
            await appendMessage(sessionId, assistantMsg);
          }
        } catch (err) {
          const errorEvent = `event: error\ndata: ${JSON.stringify({
            type: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          await releaseLock(sessionId);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
