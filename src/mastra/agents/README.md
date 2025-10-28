# Agents Directory

This directory contains all the AI agents for the Chef Assistant application. Each agent is a specialized expert in a specific domain.

## Available Agents

### 🧑‍🍳 Chef Agent (`chefAgent.ts`)
**Default agent for general cooking**

- **Persona**: Michel - Experienced home chef
- **Expertise**: Recipes, cooking techniques, ingredient suggestions
- **Tools**: `find_recipe`, `get_nutritional_info`
- **Best for**: "I have chicken and rice, what can I cook?"

```typescript
const agent = mastra.getAgent("chefAgent");
```

---

### 🥗 Nutrition Expert (`nutritionExpertAgent.ts`)
**Specialized in nutrition and dietary advice**

- **Persona**: Dr. Sarah - Certified nutritionist
- **Expertise**: Calories, macros, dietary restrictions, health goals
- **Tools**: `get_nutritional_info`
- **Best for**: "How many calories are in this dish?"

```typescript
const agent = mastra.getAgent("nutritionExpert");
```

---

### 📅 Meal Planner (`mealPlannerAgent.ts`)
**Expert in meal planning and organization**

- **Persona**: Emma - Meal planning consultant
- **Expertise**: Weekly plans, batch cooking, shopping lists
- **Tools**: `find_recipe`, `get_nutritional_info`
- **Best for**: "Help me plan meals for the week"

```typescript
const agent = mastra.getAgent("mealPlanner");
```

---

### 🍷 Sommelier (`sommelierAgent.ts`)
**Wine and beverage pairing specialist**

- **Persona**: Jean-Pierre - Master sommelier
- **Expertise**: Wine pairings, beverage recommendations
- **Tools**: `suggest_wine_pairing`
- **Best for**: "What wine pairs with salmon?"

```typescript
const agent = mastra.getAgent("sommelier");
```

---

### 🎯 Orchestrator (`orchestratorAgent.ts`)
**Router agent that delegates to specialists**

- **Role**: Coordinator and router
- **Expertise**: Intent recognition, agent selection
- **Tools**: None (pure routing)
- **Best for**: Automatic expert selection

```typescript
const agent = mastra.getAgent("orchestrator");
```

---

## Quick Start

### Using the Default Agent

```typescript
// app/api/chat/route.ts
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  const agent = mastra.getAgent("chefAgent"); // Default
  const result = await agent.stream(messages, {
    memory: { thread: threadId, resource: "user" }
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

### Switching Between Agents

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  const agent = mastra.getAgent(agentName);
  const result = await agent.stream(messages, {
    memory: { thread: threadId, resource: "user" }
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

### Using from Frontend

```typescript
// app/assistant.tsx
const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    body: {
      agentName: "nutritionExpert" // Specify which agent
    }
  }),
});
```

---

## Agent Architecture Patterns

### Pattern 1: Single Agent (Current Default)
```
User → API → chefAgent → Response
```
**Pros**: Simple, single context
**Cons**: Limited specialization

### Pattern 2: User-Selected Agent
```
User → [Agent Selector UI] → API → Selected Agent → Response
```
**Pros**: Clear control, explicit choice
**Cons**: User must know which to choose

### Pattern 3: Orchestrator-Based
```
User → API → Orchestrator → Analyze Intent → Delegate to Specialist → Response
```
**Pros**: Automatic selection, best expert
**Cons**: More complex, extra latency

---

## Creating a New Agent

### Step 1: Define the Agent

```typescript
// mastra/agents/myNewAgent.ts
import { Agent } from "@mastra/core/agent";
import { defaultModels } from "../models";
import { memory } from "../memory";

export const myNewAgent = new Agent({
  name: "my-new-agent",
  instructions: `You are [Name], a [role] with [expertise].

Your approach:
- [Key behavior 1]
- [Key behavior 2]

When helping users:
1. [Step 1]
2. [Step 2]

Your personality: [traits]`,

  model: defaultModels.agent, // Or choose appropriate model

  tools: {
    // Add relevant tools
  },

  memory,
});
```

### Step 2: Add to Mastra Instance

```typescript
// mastra/index.ts
import { myNewAgent } from "./agents/myNewAgent";

export const mastra = new Mastra({
  agents: {
    // ... existing agents
    myNew: myNewAgent,
  },
  // ... rest of config
});
```

### Step 3: Update Type Definitions

```typescript
// mastra/index.ts
export function getAgent(
  agentName:
    | "orchestrator"
    | "chefAgent"
    | "nutritionExpert"
    | "mealPlanner"
    | "sommelier"
    | "myNew" // Add here
) {
  return mastra.getAgent(agentName);
}
```

### Step 4: Test the Agent

```bash
# Test via API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "myNew",
    "messages": [{"role": "user", "content": "test message"}]
  }'
```

---

## Best Practices

### ✅ Do

1. **Give agents clear personas**
   - Name and background
   - Specific expertise
   - Distinct personality

2. **Define when to use each agent**
   - Document use cases
   - Provide examples
   - Explain boundaries

3. **Use shared memory**
   - All agents see conversation history
   - Maintains context across switches
   - Better user experience

4. **Choose appropriate models**
   - Fast models for conversation
   - Quality models for tools
   - See `mastra/models.ts`

5. **Provide clear instructions**
   - What the agent does
   - How it should behave
   - When to use tools

### ❌ Don't

1. **Don't create overlapping agents**
   - Avoid duplicate capabilities
   - Consolidate similar domains
   - Use tool parameters instead

2. **Don't use expensive models unnecessarily**
   - Reserve premium models for complex tasks
   - Use fast models for chat
   - Monitor costs

3. **Don't forget error handling**
   - Validate agent names
   - Handle tool failures
   - Provide fallbacks

---

## Testing Agents

### Unit Test Example

```typescript
// __tests__/agents/chefAgent.test.ts
import { chefAgent } from "@/mastra/agents/chefAgent";

describe("ChefAgent", () => {
  it("should suggest recipes based on ingredients", async () => {
    const result = await chefAgent.generate([
      { role: "user", content: "I have chicken and rice" }
    ]);

    expect(result).toContain("recipe");
  });
});
```

### Integration Test Example

```typescript
// __tests__/api/multi-agent.test.ts
describe("Multi-Agent API", () => {
  it("should route to nutrition expert for calorie questions", async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        agentName: "nutritionExpert",
        messages: [{ role: "user", content: "Calories in pasta?" }]
      })
    });

    expect(response.ok).toBe(true);
  });
});
```

---

## Troubleshooting

### Agent Not Found
```
Error: Agent "xyz" not found
```
**Solution**: Check that agent is registered in `mastra/index.ts`

### Tool Not Working
```
Error: Tool "abc" not defined
```
**Solution**: Verify tool is imported and added to agent's `tools` object

### Memory Not Persisting
```
Agent doesn't remember previous messages
```
**Solution**: Ensure `memory` is imported and passed to Agent, and threadId is consistent

### Wrong Model Being Used
```
Costs are too high / Responses too slow
```
**Solution**: Check `model` configuration, use `defaultModels` from `mastra/models.ts`

---

## See Also

- [Multi-Agent Architecture Guide](../MULTI_AGENT_GUIDE.md)
- [Model Configuration](../models.ts)
- [Tools Documentation](../tools/README.md)
- [Main Mastra Instance](../index.ts)
