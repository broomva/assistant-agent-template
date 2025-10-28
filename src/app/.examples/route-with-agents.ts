import { mastra } from "@/mastra";

export const maxDuration = 30;

/**
 * Multi-Agent Chat API Route
 *
 * This enhanced version supports:
 * - Agent selection via request body
 * - Validation of agent names
 * - Fallback to default agent
 * - Memory persistence per thread
 * - User-specific memory (when resource provided)
 *
 * Usage from frontend:
 * ```typescript
 * const runtime = useChatRuntime({
 *   transport: new AssistantChatTransport({
 *     api: "/api/chat",
 *     body: {
 *       agentName: "nutritionExpert",  // Optional
 *       resource: "user-123",           // Optional
 *     }
 *   })
 * });
 * ```
 */
export async function POST(req: Request) {
  try {
    const {
      messages,
      threadId,
      agentName = "chefAgent", // Default to chef
      resource = "user", // Default resource
    } = await req.json();

    // Generate thread ID if not provided
    const actualThreadId = threadId || `thread-${Date.now()}`;

    // Validate agent name
    const validAgents = [
      "orchestrator",
      "chefAgent",
      "nutritionExpert",
      "mealPlanner",
      "sommelier",
    ] as const;

    type ValidAgentName = (typeof validAgents)[number];

    // Type guard to check if agent name is valid
    const isValidAgent = (name: string): name is ValidAgentName => {
      return (validAgents as readonly string[]).includes(name);
    };

    // Use default if invalid agent name provided
    const selectedAgentName: ValidAgentName = isValidAgent(agentName)
      ? agentName
      : "chefAgent";

    // Log agent selection (helpful for debugging)
    console.log(`[Chat API] Using agent: ${selectedAgentName}`);
    console.log(`[Chat API] Thread: ${actualThreadId}`);
    console.log(`[Chat API] Resource: ${resource}`);

    // Get the selected agent
    const agent = mastra.getAgent(selectedAgentName);

    if (!agent) {
      return new Response(
        JSON.stringify({
          error: `Agent "${selectedAgentName}" not found`,
        }),
        { status: 404 }
      );
    }

    // Stream with memory context
    const result = await agent.stream(messages, {
      memory: {
        thread: actualThreadId,
        resource, // Can be user ID for multi-user support
      },
    });

    return result.aisdk.v5.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

/**
 * Alternative: Automatic Agent Routing
 *
 * This version analyzes the user's message and automatically
 * selects the most appropriate agent.
 */
export async function POST_WITH_AUTO_ROUTING(req: Request) {
  const {
    messages,
    threadId,
    resource = "user",
  } = await req.json();

  const actualThreadId = threadId || `thread-${Date.now()}`;

  // Valid agent names
  type ValidAgentName = "orchestrator" | "chefAgent" | "nutritionExpert" | "mealPlanner" | "sommelier";

  // Get the last user message
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Simple keyword-based routing (can be enhanced with LLM)
  let agentName: ValidAgentName;

  if (
    lastMessage.includes("nutrition") ||
    lastMessage.includes("calories") ||
    lastMessage.includes("macro") ||
    lastMessage.includes("healthy")
  ) {
    agentName = "nutritionExpert";
  } else if (
    lastMessage.includes("meal plan") ||
    lastMessage.includes("weekly") ||
    lastMessage.includes("prep") ||
    lastMessage.includes("plan")
  ) {
    agentName = "mealPlanner";
  } else if (
    lastMessage.includes("wine") ||
    lastMessage.includes("pairing") ||
    lastMessage.includes("beverage") ||
    lastMessage.includes("drink")
  ) {
    agentName = "sommelier";
  } else {
    agentName = "chefAgent"; // Default
  }

  console.log(`[Auto-Route] Selected agent: ${agentName} for query: "${lastMessage.slice(0, 50)}..."`);

  // Type-safe agent retrieval
  const agent = mastra.getAgent(agentName);
  const result = await agent.stream(messages, {
    memory: { thread: actualThreadId, resource },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}

/**
 * Alternative: Use Orchestrator for Routing
 *
 * This version uses the orchestrator agent to analyze intent
 * and suggest which specialist to use.
 */
export async function POST_WITH_ORCHESTRATOR(req: Request) {
  const {
    messages,
    threadId,
    resource = "user",
  } = await req.json();

  const actualThreadId = threadId || `thread-${Date.now()}`;

  // Option 1: Always use orchestrator (it suggests specialists in its response)
  const orchestrator = mastra.getAgent("orchestrator");
  const result = await orchestrator.stream(messages, {
    memory: { thread: actualThreadId, resource },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();

  // Option 2: Use orchestrator to route, then delegate
  // (More complex - requires two LLM calls)
  // Implementation left as exercise
}
