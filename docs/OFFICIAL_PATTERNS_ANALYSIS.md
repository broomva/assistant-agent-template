# Official Patterns Analysis

After researching Mastra and Assistant-UI official documentation and examples, here's what I learned about best practices for multi-agent implementations.

## Key Discoveries

### 1. Assistant-UI Runtime (Simplified in v0.11+)

**What the docs show:**
```typescript
// ✅ OFFICIAL PATTERN - Simple and clean
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

export default function Home() {
  const runtime = useChatRuntime(); // That's it!

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
```

**What we did (over-complicated):**
```typescript
// ❌ TOO COMPLEX
const runtime = useChatRuntime({
  transport: new AssistantChatTransport({
    api: "/api/chat",
    body: { agentName: selectedAgent } // Not needed for basic setup
  })
});
```

**Better approach:**
```typescript
// ✅ SIMPLE - Only customize when needed
const runtime = useChatRuntime({
  api: "/api/chat", // Can pass API directly
});

// OR with custom body:
const runtime = useChatRuntime({
  body: { agentName: selectedAgent } // Simpler than full transport
});
```

---

### 2. Mastra Agent Selection

**What the docs show:**
```typescript
// ✅ OFFICIAL PATTERN - Simple string names
export const mastra = new Mastra({
  agents: { assistantAgent }
});

const agent = mastra.getAgent('assistantAgent'); // Just a string!
```

**What we did (over-engineered):**
```typescript
// ❌ OVER-ENGINEERED TYPE CHECKING
const validAgents = ["orchestrator", "chefAgent", ...] as const;
type ValidAgentName = (typeof validAgents)[number];
const selectedAgent = validAgents.includes(agentName as ValidAgentName)
  ? (agentName as ValidAgentName)
  : "chefAgent";
```

**Better approach:**
```typescript
// ✅ SIMPLE - Let Mastra handle validation
const agent = mastra.getAgent(agentName || "chefAgent");
// Mastra will throw if agent doesn't exist
```

---

### 3. Memory Pattern (We Got This Right!)

**Official Mastra pattern:**
```typescript
// ✅ OFFICIAL PATTERN - Resource-scoped memory
const result = await agent.stream(messages, {
  memory: {
    thread: threadId,    // Conversation thread
    resource: userId     // User identity (persists across threads!)
  }
});
```

**What we did:**
```typescript
// ✅ CORRECT - We followed this pattern
memory: {
  thread: actualThreadId,
  resource: "user"
}
```

**💡 Key Insight**: `resource` scope means memory persists across ALL threads for that user!

---

## Improved Implementation

Based on official patterns, here's the better way:

### Simple API Route (Based on Mastra Examples)

```typescript
// app/api/chat/route.ts
import { mastra } from "@/mastra";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  // ✅ Simple - Let Mastra validate
  const agent = mastra.getAgent(agentName);

  // ✅ Official memory pattern
  const result = await agent.stream(messages, {
    memory: {
      thread: threadId || `thread-${Date.now()}`,
      resource: "user" // Or dynamic: userId
    }
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

### Simple Frontend (Based on Assistant-UI Examples)

```typescript
// app/assistant.tsx
"use client";

import { useState } from "react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { AgentSelector } from "@/components/assistant-ui/agent-selector";

export const Assistant = () => {
  const [selectedAgent, setSelectedAgent] = useState("chefAgent");

  // ✅ SIMPLIFIED - No custom transport needed
  const runtime = useChatRuntime({
    api: "/api/chat",
    body: { agentName: selectedAgent }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-dvh flex-col">
        <AgentSelector
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
        />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
```

---

## Comparison: Our Implementation vs Official Pattern

### API Route

| Aspect | Our Implementation | Official Pattern | Winner |
|--------|-------------------|------------------|--------|
| Type Checking | Complex union types | Simple strings | Official ✅ |
| Validation | Pre-validate everything | Let framework handle it | Official ✅ |
| Error Handling | Custom try-catch | Framework errors | Official ✅ |
| Code Lines | ~80 lines | ~15 lines | Official ✅ |

### Frontend

| Aspect | Our Implementation | Official Pattern | Winner |
|--------|-------------------|------------------|--------|
| Runtime Setup | Custom transport config | Built-in config | Official ✅ |
| Complexity | High (custom transport) | Low (simple hook) | Official ✅ |
| Flexibility | Same | Same | Tie |
| Maintenance | More code to maintain | Less code | Official ✅ |

---

## Why Our Approach Was Over-Engineered

1. **TypeScript Strictness**: We tried to enforce too much at compile time
   - Official: Let runtime validation handle it
   - Result: Simpler code, same safety

2. **Premature Abstraction**: Created complex types before needed
   - Official: Start simple, add complexity when required
   - Result: Easier to understand and modify

3. **Framework Fighting**: Didn't trust framework validation
   - Official: Frameworks have built-in error handling
   - Result: More robust with less code

---

## What We Got Right

1. ✅ **Memory Architecture**: Resource-scoped memory is exactly right
2. ✅ **Agent Specialization**: Multiple agents for different domains
3. ✅ **Tool UI Pattern**: makeAssistantToolUI is correct
4. ✅ **Model Selection**: Separate models for agents vs tools
5. ✅ **Documentation**: Comprehensive guides and examples

---

## Recommendations

### Immediate Changes

1. **Simplify API Route**
   - Remove complex type checking
   - Trust Mastra's getAgent() validation
   - Let framework errors bubble up

2. **Simplify Runtime Config**
   - Use built-in `useChatRuntime()` patterns
   - Remove custom transport unless needed
   - Pass config directly to hook

3. **Fix TypeScript Error**
   - Remove strict agent name unions
   - Use simple string types
   - Add runtime validation only if needed

### Keep What Works

1. ✅ Agent Selector UI component
2. ✅ Memory configuration (resource-scoped)
3. ✅ Model optimization strategy
4. ✅ Tool UI implementations
5. ✅ Documentation structure

---

## Migration Path

### Phase 1: Simplify Core (Now)
1. Update API route to official pattern
2. Simplify runtime configuration
3. Fix TypeScript errors

### Phase 2: Test & Validate (Next)
1. Test all agent switches
2. Verify memory persistence
3. Check error handling

### Phase 3: Optimize (Later)
1. Add monitoring/logging
2. Implement auto-routing if needed
3. Add advanced features

---

## Code Comparison

### Before (Our Implementation)

```typescript
// 40+ lines of validation and type checking
const validAgents = [...] as const;
type ValidAgentName = (typeof validAgents)[number];

export async function POST(req: Request) {
  try {
    const { messages, threadId, agentName = "chefAgent", resource = "user" } = await req.json();
    const actualThreadId = threadId || `thread-${Date.now()}`;

    const selectedAgentName = validAgents.includes(agentName as ValidAgentName)
      ? (agentName as ValidAgentName)
      : "chefAgent";

    console.log(`[Chat API] Using agent: ${selectedAgentName}`);
    // ... more validation

    const agent = mastra.getAgent(selectedAgentName);
    if (!agent) {
      return new Response(JSON.stringify({ error: "..." }), { status: 404 });
    }
    // ... more code
  } catch (error) {
    // Complex error handling
  }
}
```

### After (Official Pattern)

```typescript
// 10 lines - clean and simple
export async function POST(req: Request) {
  const { messages, threadId, agentName = "chefAgent" } = await req.json();

  const agent = mastra.getAgent(agentName);
  const result = await agent.stream(messages, {
    memory: {
      thread: threadId || `thread-${Date.now()}`,
      resource: "user"
    }
  });

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

**Difference**: 75% less code, same functionality, better error handling from framework

---

## Lessons Learned

### 1. Trust the Framework
- Mastra has built-in validation
- Assistant-UI handles errors gracefully
- Don't reimpl framework features

### 2. Start Simple
- Add complexity only when needed
- Official examples are simple for a reason
- Complex types != better code

### 3. Follow Official Patterns
- Frameworks evolve their APIs
- Official examples show best practices
- Community support aligns with official patterns

### 4. TypeScript Balance
- Type safety is good
- Over-constraining is bad
- Runtime validation often sufficient

---

## Conclusion

**Our implementation was functionally correct but over-engineered.**

The official patterns are:
- ✅ Simpler (75% less code)
- ✅ More maintainable
- ✅ Better aligned with framework evolution
- ✅ Easier for other developers to understand

**Next step**: Implement the simplified version and compare behavior.

**The good news**: Our core architecture (memory, agents, tools) is solid. We just need to simplify the glue code connecting everything.
