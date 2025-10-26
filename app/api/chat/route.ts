import { mastra } from "@/mastra";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  // Generate a thread ID if not provided
  const actualThreadId = threadId || `thread-${Date.now()}`;

  // Get the agent with memory enabled
  const agent = mastra.getAgent("chefAgent");

  // Stream with memory context
  const result = await agent.stream(messages, {
    memory: {
      thread: actualThreadId,
      resource: "user", // You can make this dynamic per user if needed
    },
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
