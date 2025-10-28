# Assistant-UI Multi-Agent Integration Guide

## Overview

This guide explains how to integrate the multi-agent architecture with Assistant-UI. You'll learn different patterns for agent selection, routing, and UI integration.

**TL;DR**: Assistant-UI works seamlessly with multi-agent setups. You just need to tell it which agent to use via the API transport.

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Integration Patterns](#integration-patterns)
3. [Implementation Options](#implementation-options)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

---

## How It Works

### The Flow

```
┌─────────────────┐
│  User Interface │
│ (Assistant-UI)  │
│                 │
│ [Agent Selector]│  ← User picks agent (optional)
│  👨‍🍳 Chef       │
│  🥗 Nutritionist│
│  📅 Planner     │
│  🍷 Sommelier   │
└────────┬────────┘
         │
         │ useChatRuntime({ body: { agentName: "..." } })
         │
         ▼
┌─────────────────┐
│   API Route     │
│  /api/chat      │
│                 │
│ Extract agent   │
│ name from body  │
└────────┬────────┘
         │
         │ mastra.getAgent(agentName)
         │
         ▼
┌─────────────────┐
│  Mastra Agent   │
│  (Selected)     │
│                 │
│ • chefAgent     │
│ • nutritionExp  │
│ • mealPlanner   │
│ • sommelier     │
└─────────────────┘
```

### Key Insight

**Assistant-UI doesn't care which agent you use** - it just:
1. Sends messages to your API
2. Receives streamed responses
3. Renders the UI

You control agent selection at the API level.

---

## Integration Patterns

### Pattern 1: Single Agent (Current - No Changes)

**Complexity**: ⭐ Simple
**Flexibility**: Low
**Best for**: Starting simple, single-purpose chatbot

```typescript
// app/assistant.tsx
const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    // No agent selection - always uses default
  }),
});

// app/api/chat/route.ts
const agent = mastra.getAgent("chefAgent"); // Always chef
```

**Pros**:
- ✅ Simple - no configuration needed
- ✅ Works out of the box
- ✅ Single conversation context

**Cons**:
- ❌ Limited to one agent's capabilities
- ❌ No specialization

---

### Pattern 2: User-Selected Agent (Recommended)

**Complexity**: ⭐⭐ Medium
**Flexibility**: High
**Best for**: Most use cases, clear user control

```typescript
// app/assistant.tsx
const [selectedAgent, setSelectedAgent] = useState("chefAgent");

const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    body: {
      agentName: selectedAgent, // Pass selected agent
    },
  }),
});

// UI includes AgentSelector component
<AgentSelector
  selectedAgent={selectedAgent}
  onAgentChange={setSelectedAgent}
/>
```

```typescript
// app/api/chat/route.ts
const { messages, threadId, agentName = "chefAgent" } = await req.json();
const agent = mastra.getAgent(agentName);
```

**Pros**:
- ✅ Clear user control
- ✅ Can switch experts mid-conversation
- ✅ Maintains context per thread
- ✅ Easy to understand

**Cons**:
- ❌ User must choose correct expert
- ❌ Requires UI for selection

---

### Pattern 3: Automatic Routing (Advanced)

**Complexity**: ⭐⭐⭐ Complex
**Flexibility**: Highest
**Best for**: Seamless UX, smart delegation

```typescript
// app/assistant.tsx
const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    // No agent specified - API auto-selects
  }),
});

// app/api/chat/route.ts
function selectAgentByIntent(message: string): string {
  if (message.includes("nutrition") || message.includes("calories")) {
    return "nutritionExpert";
  }
  if (message.includes("wine") || message.includes("pairing")) {
    return "sommelier";
  }
  return "chefAgent";
}

const agentName = selectAgentByIntent(lastMessage);
const agent = mastra.getAgent(agentName);
```

**Pros**:
- ✅ Seamless user experience
- ✅ Automatic expert selection
- ✅ No UI clutter

**Cons**:
- ❌ Complex routing logic needed
- ❌ May select wrong agent
- ❌ Harder to debug

---

### Pattern 4: Orchestrator-Based (Most Advanced)

**Complexity**: ⭐⭐⭐⭐ Very Complex
**Flexibility**: Maximum
**Best for**: Multi-agent collaboration, complex queries

```typescript
// app/api/chat/route.ts
const orchestrator = mastra.getAgent("orchestrator");

// Orchestrator analyzes intent and delegates
const result = await orchestrator.stream(messages, {
  memory: { thread, resource }
});

// Orchestrator can suggest specialists in its response
```

**Pros**:
- ✅ Most intelligent routing
- ✅ Can combine multiple agents
- ✅ Learns from context

**Cons**:
- ❌ Most complex to implement
- ❌ Extra LLM call for routing
- ❌ Higher latency

---

## Implementation Options

### Option A: Quick Start (5 minutes)

Just update the API route to support agent selection:

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

Test it:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "nutritionExpert",
    "messages": [{"role": "user", "content": "Calories in pasta?"}]
  }'
```

---

### Option B: Add UI Selector (20 minutes)

1. **Copy the agent selector component** (already created):
   - `components/assistant-ui/agent-selector.tsx` ✅

2. **Replace `app/assistant.tsx`** with the version that includes agent selection:
   - Use `app/assistant-with-agent-selector.tsx` as reference

3. **Update the API route** to use the code from:
   - `app/api/chat/route-with-agents.ts`

4. **Test**:
   ```bash
   bun run dev
   # Open http://localhost:3000
   # You should see agent selector in the UI
   ```

---

### Option C: Automatic Routing (30 minutes)

1. **Implement intent detection** in API route
2. **Use keyword matching** or LLM for analysis
3. **Log routing decisions** for monitoring
4. **Add fallback** to default agent

See `route-with-agents.ts` `POST_WITH_AUTO_ROUTING` for implementation.

---

### Option D: Full Orchestrator (1 hour+)

1. **Use orchestrator agent** for routing
2. **Implement specialist delegation** logic
3. **Handle multi-agent collaboration**
4. **Add conversation handoffs**

This is most advanced - start with Option B first!

---

## Step-by-Step Setup

### Setup: Add Agent Selection UI

#### Step 1: Use the new components

The files are already created:
- ✅ `components/assistant-ui/agent-selector.tsx`
- ✅ `app/assistant-with-agent-selector.tsx`
- ✅ `app/api/chat/route-with-agents.ts`

#### Step 2: Replace current files

```bash
# Backup current files
cp app/assistant.tsx app/assistant.tsx.backup
cp app/api/chat/route.ts app/api/chat/route.ts.backup

# Use new versions
cp app/assistant-with-agent-selector.tsx app/assistant.tsx
cp app/api/chat/route-with-agents.ts app/api/chat/route.ts
```

#### Step 3: Test

```bash
bun run dev
```

Open http://localhost:3000 and you should see:
1. Agent selector in the header
2. Ability to switch between experts
3. Each agent responds with their persona

#### Step 4: Customize

Edit `components/assistant-ui/agent-selector.tsx` to:
- Change colors
- Adjust layout
- Add/remove agents
- Customize descriptions

---

## Best Practices

### ✅ DO

1. **Validate agent names in API**
   ```typescript
   const validAgents = ["chefAgent", "nutritionExpert", ...];
   const agent = validAgents.includes(agentName)
     ? mastra.getAgent(agentName)
     : mastra.getAgent("chefAgent"); // Fallback
   ```

2. **Keep thread ID consistent**
   ```typescript
   // Agent can switch mid-conversation, but thread stays same
   const threadId = "user-123-session-456";
   ```

3. **Log agent selection**
   ```typescript
   console.log(`[Chat] Using agent: ${agentName}`);
   // Helps debugging and analytics
   ```

4. **Provide visual feedback**
   ```typescript
   <div className="agent-indicator">
     Currently consulting: {currentAgent.name}
   </div>
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     const agent = mastra.getAgent(agentName);
   } catch (error) {
     // Fall back to default agent
     agent = mastra.getAgent("chefAgent");
   }
   ```

### ❌ DON'T

1. **Don't create new thread for each agent**
   ```typescript
   // Bad - loses context
   const threadId = `${agentName}-${Date.now()}`;

   // Good - maintains context
   const threadId = threadId || `user-${userId}`;
   ```

2. **Don't forget to pass agent to API**
   ```typescript
   // Bad - API doesn't know which agent
   const runtime = useChatRuntime({ api: "/api/chat" });

   // Good - API receives agent name
   const runtime = useChatRuntime({
     api: "/api/chat",
     body: { agentName: selectedAgent }
   });
   ```

3. **Don't switch agents without user knowledge**
   ```typescript
   // Bad - confusing for user
   // Auto-switches with no indication

   // Good - show which agent is responding
   <div>Consulting: {agentName}</div>
   ```

---

## Examples

### Example 1: Simple Agent Selector

```typescript
// components/simple-agent-picker.tsx
export function SimpleAgentPicker({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="chefAgent">👨‍🍳 Chef</option>
      <option value="nutritionExpert">🥗 Nutritionist</option>
      <option value="mealPlanner">📅 Meal Planner</option>
      <option value="sommelier">🍷 Sommelier</option>
    </select>
  );
}

// app/assistant.tsx
const [agent, setAgent] = useState("chefAgent");

<SimpleAgentPicker value={agent} onChange={setAgent} />

const runtime = useChatRuntime({
  api: "/api/chat",
  body: { agentName: agent }
});
```

### Example 2: Show Active Agent in Chat

```typescript
// components/agent-badge.tsx
export function AgentBadge({ agentName }) {
  const badges = {
    chefAgent: { icon: "👨‍🍳", name: "Chef Michel", color: "orange" },
    nutritionExpert: { icon: "🥗", name: "Dr. Sarah", color: "green" },
    // ...
  };

  const badge = badges[agentName];

  return (
    <div className={`badge badge-${badge.color}`}>
      {badge.icon} {badge.name}
    </div>
  );
}

// Use in Thread component
<div className="message-header">
  <AgentBadge agentName={currentAgent} />
</div>
```

### Example 3: Auto-Route Based on Message

```typescript
// app/api/chat/route.ts
function selectAgent(message: string) {
  const keywords = {
    nutritionExpert: ["nutrition", "calories", "macro", "diet", "healthy"],
    mealPlanner: ["plan", "weekly", "prep", "schedule", "meal plan"],
    sommelier: ["wine", "pairing", "beverage", "drink"],
  };

  for (const [agent, words] of Object.entries(keywords)) {
    if (words.some(word => message.toLowerCase().includes(word))) {
      return agent;
    }
  }

  return "chefAgent"; // Default
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  const agentName = selectAgent(lastMessage);
  console.log(`Auto-routed to: ${agentName}`);

  const agent = mastra.getAgent(agentName);
  // ... rest of code
}
```

### Example 4: Show Agent Capabilities

```typescript
// components/agent-info.tsx
export function AgentInfo({ agentName }) {
  const info = {
    chefAgent: {
      name: "Chef Michel",
      expertise: ["Recipes", "Cooking techniques", "Ingredients"],
      bestFor: "Finding recipes and cooking help"
    },
    nutritionExpert: {
      name: "Dr. Sarah",
      expertise: ["Nutrition analysis", "Dietary planning", "Health goals"],
      bestFor: "Calorie counting and nutrition advice"
    },
    // ...
  };

  const agent = info[agentName];

  return (
    <div className="agent-info">
      <h3>{agent.name}</h3>
      <p><strong>Best for:</strong> {agent.bestFor}</p>
      <ul>
        {agent.expertise.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
```

---

## Troubleshooting

### Problem: Agent not switching

**Symptoms**: UI shows different agent, but responses are from same agent

**Solution**:
```typescript
// Check that body is being passed correctly
const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    body: { agentName: selectedAgent }, // ← Make sure this is here
  }),
});

// Check API is reading it
const { agentName } = await req.json();
console.log("Received agent:", agentName); // ← Add logging
```

### Problem: Conversation context lost

**Symptoms**: Agent doesn't remember previous messages

**Solution**:
```typescript
// Ensure threadId stays consistent
const threadId = threadId || `thread-${Date.now()}`;

// Don't create new thread when switching agents
// Keep same thread, just change agent
```

### Problem: Tool UIs not showing

**Symptoms**: Tools execute but UI doesn't render

**Solution**:
```typescript
// Make sure tool UIs are registered
<AssistantRuntimeProvider runtime={runtime}>
  <RecipeToolUI />      {/* ← Must be here */}
  <NutritionToolUI />   {/* ← Must be here */}
  <WinePairingToolUI /> {/* ← Add for new tools */}
  <Thread />
</AssistantRuntimeProvider>
```

### Problem: Invalid agent name error

**Symptoms**: API returns 404 or error

**Solution**:
```typescript
// Add validation
const validAgents = ["chefAgent", "nutritionExpert", "mealPlanner", "sommelier"];

const selectedAgent = validAgents.includes(agentName)
  ? agentName
  : "chefAgent"; // Fallback to default
```

---

## Summary

### Key Takeaways

1. **Assistant-UI is agent-agnostic** - it just renders the response
2. **Agent selection happens at API level** - pass via transport body
3. **Start simple** - single agent, then add selection later
4. **Keep thread ID consistent** - agents can switch, context remains

### Quick Reference

| Pattern | Complexity | Best For | Setup Time |
|---------|-----------|----------|------------|
| Single Agent | ⭐ | Simple apps | 0 min (current) |
| User-Selected | ⭐⭐ | Most apps | 20 min |
| Auto-Routing | ⭐⭐⭐ | Smart UX | 30 min |
| Orchestrator | ⭐⭐⭐⭐ | Advanced | 1+ hour |

### Next Steps

1. ✅ Choose a pattern (recommend User-Selected)
2. ✅ Update API route to accept agentName
3. ✅ Add agent selector component to UI
4. ✅ Test agent switching
5. ✅ Add visual feedback (agent badge)
6. ✅ Monitor and refine

---

## Resources

- [Assistant-UI Documentation](https://www.assistant-ui.com/docs)
- [Mastra Multi-Agent Guide](./MULTI_AGENT_GUIDE.md)
- [Agent Directory README](./mastra/agents/README.md)
- [Example Files](./app/assistant-with-agent-selector.tsx)

---

**Ready to implement?** Start with Option B (Add UI Selector) - it's the best balance of simplicity and functionality!
