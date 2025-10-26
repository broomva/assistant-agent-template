import { mastra } from "@/mastra";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const agent = mastra.getAgent("chefAgent");
  const result = await agent.stream(messages);

  return result.aisdk.v5.toUIMessageStreamResponse();
}
