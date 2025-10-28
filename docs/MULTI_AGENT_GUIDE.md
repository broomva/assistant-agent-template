# Multi-Agent & Multi-Model Architecture Guide

This guide explains the multi-agent architecture patterns and model selection strategies implemented in this Chef Assistant project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Model Selection Strategy](#model-selection-strategy)
3. [Agent Patterns](#agent-patterns)
4. [Using Multiple Agents](#using-multiple-agents)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│                    (Assistant-UI)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Route (/api/chat)                      │
│              Receives: messages, threadId, agentName        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mastra Instance                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Orchestrator │  │  Chef Agent  │  │   Nutrition  │     │
│  │   (Router)   │  │   (Default)  │  │    Expert    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Meal Planner │  │  Sommelier   │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                              │
│  Shared Resources:                                          │
│  - LibSQL Storage (file:local.db)                          │
│  - Memory System (conversation history)                    │
│  - Logger (console with log levels)                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Model Providers                          │
│                                                              │
│  GPT-4o-mini        Claude Sonnet      Claude Haiku        │
│  (Conversation)     (Tools)            (Fast tasks)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Model Selection Strategy

### Philosophy: Right Model for the Right Job

Different AI models have different strengths and cost profiles. We optimize by using:

- **Fast & Cheap models** for agent orchestration and general conversation
- **Balanced models** for tool execution where quality matters
- **Premium models** for complex reasoning and analysis

### Cost Comparison

| Model | Use Case | Cost (per 1M tokens) | Speed |
|-------|----------|---------------------|-------|
| GPT-4o-mini | Agent conversation | ~$0.15-0.60 | ⚡ Fast |
| Claude Haiku | Simple structured tasks | ~$0.80-4.00 | ⚡ Fast |
| GPT-4o | Balanced workloads | ~$2.50-10.00 | ⚡ Medium |
| Claude Sonnet | Tool execution, structured output | ~$3.00-15.00 | ⚡ Medium |
| Claude Opus | Complex analysis | ~$15.00-75.00 | 🐌 Slower |
| o1-preview | Advanced reasoning | ~$15.00-60.00 | 🐌 Slower |

### Model Configuration (`mastra/models.ts`)

We've created a centralized model configuration with clear use case mappings:

```typescript
import { defaultModels, selectModel } from "./mastra/models";

// Option 1: Use pre-configured defaults
const model = defaultModels.agent;        // GPT-4o-mini (conversation)
const toolModel = defaultModels.tools;    // Claude Sonnet (quality)

// Option 2: Dynamic selection
const model = selectModel("conversation", "fast");    // GPT-4o-mini
const model = selectModel("structured", "balanced");  // Claude Sonnet
const model = selectModel("reasoning", "premium");    // Claude Opus
```

### When to Use Each Model

#### GPT-4o-mini (Agent Orchestration)
```typescript
model: defaultModels.agent
```
✅ **Best for:**
- Agent conversation and routing
- Simple questions and responses
- Deciding which tools to call
- Cost-sensitive applications

❌ **Not ideal for:**
- Complex structured output
- Advanced reasoning
- High-stakes decisions

#### Claude Sonnet (Tool Execution)
```typescript
model: defaultModels.tools
```
✅ **Best for:**
- Tool execution with structured output
- Recipe generation
- Nutritional analysis
- Data extraction from web search

❌ **Not ideal for:**
- Simple chat (expensive)
- Real-time streaming (slower)

#### Claude Haiku (Fast Tasks)
```typescript
model: fastAnthropic
```
✅ **Best for:**
- Simple structured tasks
- Quick lookups
- Fast responses needed
- High volume, low complexity

---

## Agent Patterns

### Pattern 1: Specialized Agents (Current Implementation)

Each agent is an expert in a specific domain with:
- Specialized instructions (persona + expertise)
- Relevant tools for their domain
- Shared memory for context

**Agents in this project:**

#### 1. Chef Agent (Default)
```typescript
mastra.getAgent("chefAgent")
```
- **Persona**: Michel, experienced home chef
- **Domain**: General cooking, recipes, ingredients
- **Tools**: find_recipe, get_nutritional_info
- **When to use**: Default for most cooking questions

#### 2. Nutrition Expert
```typescript
mastra.getAgent("nutritionExpert")
```
- **Persona**: Dr. Sarah, certified nutritionist
- **Domain**: Nutrition, dietary planning, health goals
- **Tools**: get_nutritional_info
- **When to use**: Calorie counting, macros, dietary restrictions

#### 3. Meal Planner
```typescript
mastra.getAgent("mealPlanner")
```
- **Persona**: Emma, meal planning consultant
- **Domain**: Weekly planning, batch cooking, organization
- **Tools**: find_recipe, get_nutritional_info
- **When to use**: Weekly meal plans, prep strategies, shopping lists

#### 4. Sommelier
```typescript
mastra.getAgent("sommelier")
```
- **Persona**: Jean-Pierre, master sommelier
- **Domain**: Wine and beverage pairings
- **Tools**: suggest_wine_pairing
- **When to use**: Wine recommendations, pairing advice

#### 5. Orchestrator (Router)
```typescript
mastra.getAgent("orchestrator")
```
- **Role**: Routes requests to appropriate specialists
- **Domain**: Intent recognition and delegation
- **Tools**: None (pure routing)
- **When to use**: When you want automatic agent selection

### Pattern 2: Agent Selection Strategies

#### Strategy A: Single Default Agent (Simplest)
```typescript
// app/api/chat/route.ts
const agent = mastra.getAgent("chefAgent");
const result = await agent.stream(messages, { memory: { thread, resource } });
```

**Pros:**
- Simple implementation
- Single conversation context
- Good for focused use cases

**Cons:**
- Limited expertise depth
- All tasks go through one agent

#### Strategy B: User-Selected Agent
```typescript
// app/api/chat/route.ts
const { messages, threadId, agentName = "chefAgent" } = await req.json();
const agent = mastra.getAgent(agentName);
const result = await agent.stream(messages, { memory: { thread, resource } });
```

**Pros:**
- User controls which expert they consult
- Clear separation of concerns
- Can switch specialists mid-conversation

**Cons:**
- User must know which agent to choose
- Need UI for agent selection

#### Strategy C: Orchestrator-Based Routing (Advanced)
```typescript
// app/api/chat/route.ts
const orchestrator = mastra.getAgent("orchestrator");

// Orchestrator analyzes intent and suggests specialist
const routing = await orchestrator.generate(messages);

// Then delegate to specialist (implementation needed)
const specialist = determineSpecialist(routing);
const result = await specialist.stream(messages, { memory: { thread, resource } });
```

**Pros:**
- Automatic expert selection
- Best agent for each query
- Seamless user experience

**Cons:**
- More complex implementation
- Requires orchestration logic
- Extra LLM call for routing

---

## Using Multiple Agents

### Example 1: Switching Agents in UI

Add agent selection to the frontend:

```typescript
// app/assistant.tsx
const [selectedAgent, setSelectedAgent] = useState("chefAgent");

const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    body: { agentName: selectedAgent }, // Pass agent name
  }),
});

return (
  <div>
    <AgentSelector onChange={setSelectedAgent} />
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  </div>
);
```

### Example 2: Dynamic Agent Selection in API

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, threadId, agentName } = await req.json();

  // Validate agent name
  const validAgents = ["chefAgent", "nutritionExpert", "mealPlanner", "sommelier"];
  const selectedAgent = validAgents.includes(agentName) ? agentName : "chefAgent";

  const agent = mastra.getAgent(selectedAgent);
  const result = await agent.stream(messages, {
    memory: { thread: threadId, resource: "user" }
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

### Example 3: Intent-Based Routing

```typescript
// Helper function to route based on keywords
function selectAgentByIntent(lastMessage: string): string {
  const lower = lastMessage.toLowerCase();

  if (lower.includes("nutrition") || lower.includes("calories") || lower.includes("macro")) {
    return "nutritionExpert";
  }
  if (lower.includes("meal plan") || lower.includes("weekly") || lower.includes("prep")) {
    return "mealPlanner";
  }
  if (lower.includes("wine") || lower.includes("pairing") || lower.includes("beverage")) {
    return "sommelier";
  }

  return "chefAgent"; // Default
}

// In API route
const agentName = req.body.agentName || selectAgentByIntent(messages[messages.length - 1].content);
```

---

## Best Practices

### ✅ DO

1. **Use specialized agents for distinct domains**
   ```typescript
   // Good: Clear separation
   nutritionExpert  // Health & nutrition
   sommelier        // Wine & beverages
   chefAgent        // General cooking
   ```

2. **Choose models based on task complexity**
   ```typescript
   // Agent orchestration: fast & cheap
   model: defaultModels.agent

   // Tool execution: quality matters
   model: defaultModels.tools
   ```

3. **Share memory across agents**
   ```typescript
   // All agents use the same memory
   import { memory } from "../memory";

   new Agent({
     memory, // Shared context
   })
   ```

4. **Document agent personas and use cases**
   ```typescript
   /**
    * Use this agent when:
    * - User asks about X
    * - Need Y capability
    */
   ```

5. **Provide clear instructions and personality**
   ```typescript
   instructions: `You are [Name], a [role] with [experience].

   Your expertise: [list]
   Your approach: [style]
   Your personality: [traits]`
   ```

### ❌ DON'T

1. **Don't create too many overlapping agents**
   ```typescript
   // Bad: Too much overlap
   italianChef, frenchChef, mexicanChef...

   // Good: One agent handles all cuisines
   chefAgent + cuisine parameter in tools
   ```

2. **Don't use expensive models for simple tasks**
   ```typescript
   // Bad: Opus for conversation
   model: premiumAnthropic

   // Good: Mini for conversation
   model: defaultModels.agent
   ```

3. **Don't forget to share memory**
   ```typescript
   // Bad: Each agent has isolated context
   new Agent({ /* no memory */ })

   // Good: Shared conversation history
   new Agent({ memory })
   ```

4. **Don't create agents without clear purpose**
   ```typescript
   // Bad: Vague agent
   "generalAssistant" // What does this do?

   // Good: Specific purpose
   "mealPlannerAgent" // Weekly meal planning
   ```

---

## Examples

### Example 1: Basic Multi-Agent Setup

```typescript
// mastra/index.ts
export const mastra = new Mastra({
  agents: {
    chef: chefAgent,
    nutritionist: nutritionExpertAgent,
  },
  storage: new LibSQLStore({ url: "file:local.db" }),
});

// app/api/chat/route.ts
const agentName = req.body.agentName || "chef";
const agent = mastra.getAgent(agentName);
```

### Example 2: Model Optimization

```typescript
// agents/expensiveAnalysisAgent.ts
import { selectModel } from "../models";

export const analysisAgent = new Agent({
  name: "analysis",
  instructions: "...",

  // Use premium model only when needed
  model: selectModel("reasoning",
    process.env.USE_PREMIUM === "true" ? "premium" : "balanced"
  ),
});
```

### Example 3: Agent with Custom Tools

```typescript
// agents/customAgent.ts
import { createTool } from "@mastra/core/tools";
import { defaultModels } from "../models";

const customTool = createTool({
  id: "custom_tool",
  execute: async ({ context }) => {
    const result = await generateObject({
      model: defaultModels.tools, // High quality for tools
      schema: mySchema,
      prompt: context.query
    });
    return result.object;
  }
});

export const customAgent = new Agent({
  model: defaultModels.agent, // Fast for orchestration
  tools: { custom_tool: customTool },
});
```

### Example 4: Shared Memory Across Agents

```typescript
// All agents access same memory
const thread = "user-123-session-456";

// Chef agent interaction
await chefAgent.stream(messages, {
  memory: { thread, resource: "user-123" }
});

// Later: Nutritionist can see chef conversation
await nutritionAgent.stream(messages, {
  memory: { thread, resource: "user-123" } // Same thread!
});
```

---

## Testing Multi-Agent Setup

### Test Agent Switching

```bash
# Test default agent
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "I have chicken"}]}'

# Test nutrition expert
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "nutritionExpert",
    "messages": [{"role": "user", "content": "Calories in pasta?"}]
  }'
```

### Monitor Model Usage

```bash
# Enable debug logging
LOG_LEVEL=debug bun run dev

# Watch for model calls in console
# You'll see which models are being used for what tasks
```

---

## Next Steps

1. **Implement agent selection in UI**
   - Add dropdown to switch between agents
   - Show agent persona/expertise

2. **Add agent-specific Tool UIs**
   - Create UI component for wine pairing results
   - Design meal plan calendar view

3. **Optimize costs**
   - Monitor which agents are called most
   - Adjust model selection based on usage patterns

4. **Add observability**
   - Track agent performance
   - Log model costs per request
   - Monitor tool execution times

5. **Enhance orchestrator**
   - Implement automatic routing logic
   - Add confidence scores
   - Support multi-agent collaboration

---

## Resources

- [Mastra Agents Documentation](https://mastra.ai/en/docs/agents/overview)
- [AI SDK Model Selection](https://ai-sdk.dev/docs/foundations/models)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Pricing](https://www.anthropic.com/pricing)

---

## Summary

This multi-agent architecture provides:

✅ **Flexibility**: Use the right agent for each task
✅ **Cost Optimization**: Fast models for conversation, quality models for tools
✅ **Scalability**: Easy to add new specialized agents
✅ **Maintainability**: Clear separation of concerns
✅ **User Experience**: Specialized expertise for different needs

The key is balancing simplicity with capability - start with a single default agent, then add specialists as needed!
