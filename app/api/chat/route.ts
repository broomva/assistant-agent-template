import { mastra } from "@/mastra";

export const maxDuration = 30;

/**
 * Multi-Agent Chat API Route
 *
 * Supports agent selection via request body while maintaining
 * backward compatibility (defaults to chefAgent).
 *
 * Usage:
 * - No agentName: Uses chefAgent (default)
 * - With agentName: Uses specified agent
 */
export async function POST(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  // Generate a thread ID if not provided
  const actualThreadId = threadId || `thread-${Date.now()}`;

  // Get the selected agent (with fallback to default)
  const agent = mastra.getAgent(agentName);

  // Log for debugging
  console.log(`[Chat API] Agent: ${agentName}, Thread: ${actualThreadId}`);

  // Stream with memory context
  const result = await agent.stream(messages, {
    memory: {
      thread: actualThreadId,
      resource: "user", // Can be dynamic: userId from auth
    },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
