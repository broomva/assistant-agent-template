import { mastra } from "@/mastra";

export const maxDuration = 30;

/**
 * Simplified Multi-Agent Chat API (Official Pattern)
 *
 * Based on Mastra official examples and best practices.
 * Much simpler than our previous implementation - lets the framework handle validation.
 *
 * Features:
 * - Simple agent selection via body
 * - Framework-native error handling
 * - Resource-scoped memory (persists across threads!)
 * - Automatic thread ID generation
 */
export async function POST(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  // Simple: Let Mastra validate the agent name
  // If invalid, Mastra will throw a clear error
  const agent = mastra.getAgent(agentName);

  // Official memory pattern: resource-scoped
  // This means memory persists across ALL threads for this user!
  const result = await agent.stream(messages, {
    memory: {
      thread: threadId || `thread-${Date.now()}`,
      resource: "user", // Could be dynamic: req.headers.get("x-user-id")
    },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}

// That's it! ~15 lines vs 80+ in our previous version
// Framework handles: validation, errors, streaming, memory persistence

/**
 * Optional: Add logging for debugging
 */
export async function POST_WITH_LOGGING(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  console.log(`[Chat] Agent: ${agentName}, Thread: ${threadId}`);

  const agent = mastra.getAgent(agentName);
  const result = await agent.stream(messages, {
    memory: {
      thread: threadId || `thread-${Date.now()}`,
      resource: "user",
    },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}

/**
 * Optional: Add user-specific memory
 */
export async function POST_WITH_USER_AUTH(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  // Get user from auth (NextAuth, Clerk, etc.)
  const userId = req.headers.get("x-user-id") || "anonymous";

  const agent = mastra.getAgent(agentName);
  const result = await agent.stream(messages, {
    memory: {
      thread: threadId || `thread-${Date.now()}`,
      resource: userId, // User-specific memory!
    },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
