# Visual Architecture Guide

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                       (Assistant-UI)                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Agent Selector (Optional)                              │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │   │
│  │  │ 👨‍🍳  │ │  🥗  │ │  📅  │ │  🍷  │                 │   │
│  │  │ Chef │ │ Nutr │ │ Plan │ │ Wine │                 │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Thread (Chat Interface)                                │   │
│  │                                                          │   │
│  │  Message: "I have chicken and rice"                    │   │
│  │  ├─ Tool Call: find_recipe                             │   │
│  │  └─ Tool UI: RecipeToolUI                              │   │
│  │     ┌─────────────────────────────────────┐            │   │
│  │     │ 🍗 Chicken Fried Rice               │            │   │
│  │     │ ⏱️  30 min  👥 4 servings           │            │   │
│  │     │ Ingredients: chicken, rice...       │            │   │
│  │     └─────────────────────────────────────┘            │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP POST
                       │ {
                       │   messages: [...],
                       │   threadId: "123",
                       │   agentName: "chefAgent"
                       │ }
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTE                                   │
│                   /app/api/chat/route.ts                        │
│                                                                  │
│  1. Extract: messages, threadId, agentName                     │
│  2. Validate: agentName in validAgents                         │
│  3. Get agent: mastra.getAgent(agentName)                      │
│  4. Stream with memory: agent.stream(messages, { memory })     │
│  5. Return: result.aisdk.v5.toUIMessageStreamResponse()        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ mastra.getAgent(agentName)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MASTRA INSTANCE                             │
│                     /mastra/index.ts                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Registered Agents                                       │  │
│  │                                                           │  │
│  │  agents: {                                               │  │
│  │    orchestrator: orchestratorAgent,  // Router          │  │
│  │    chefAgent: chefAgent,             // Default         │  │
│  │    nutritionExpert: nutritionExpertAgent,               │  │
│  │    mealPlanner: mealPlannerAgent,                       │  │
│  │    sommelier: sommelierAgent                            │  │
│  │  }                                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Shared Resources                                        │  │
│  │                                                           │  │
│  │  • Storage: LibSQLStore (file:local.db)                 │  │
│  │  • Logger: ConsoleLogger (configurable level)           │  │
│  │  • Memory: Shared across all agents                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Selected agent
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AGENT LAYER                                │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Chef Agent  │  │  Nutrition  │  │Meal Planner │           │
│  │             │  │   Expert    │  │             │           │
│  │ Model:      │  │ Model:      │  │ Model:      │           │
│  │ GPT-4o-mini │  │ GPT-4o-mini │  │ GPT-4o-mini │           │
│  │             │  │             │  │             │           │
│  │ Tools:      │  │ Tools:      │  │ Tools:      │           │
│  │ • Recipe    │  │ • Nutrition │  │ • Recipe    │           │
│  │ • Nutrition │  │             │  │ • Nutrition │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │ Sommelier   │  │Orchestrator │                             │
│  │             │  │   (Router)  │                             │
│  │ Model:      │  │ Model:      │                             │
│  │ GPT-4o-mini │  │ GPT-4o-mini │                             │
│  │             │  │             │                             │
│  │ Tools:      │  │ Tools:      │                             │
│  │ • Wine Pair │  │ None        │                             │
│  └─────────────┘  └─────────────┘                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Agent decides to call tool
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TOOLS LAYER                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  find_recipe Tool                                         │  │
│  │                                                            │  │
│  │  Input: { ingredients, cuisine, restrictions }           │  │
│  │  Model: Claude Sonnet (high quality)                     │  │
│  │  Output: { recipes: [...] }                              │  │
│  │  Method: generateObject with structured schema           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  get_nutritional_info Tool                               │  │
│  │                                                            │  │
│  │  Input: { dishName, servingSize }                        │  │
│  │  Model: Claude Haiku (fast)                              │  │
│  │  Output: { calories, protein, carbs, fat, ... }          │  │
│  │  Method: generateObject with structured schema           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  suggest_wine_pairing Tool                               │  │
│  │                                                            │  │
│  │  Input: { dishName, ingredients, cuisine, ... }          │  │
│  │  Model: Claude Sonnet (high quality)                     │  │
│  │  Output: { recommendations: [...] }                      │  │
│  │  Method: generateObject with structured schema           │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Tool result
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL PROVIDERS                             │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │     OpenAI       │  │    Anthropic     │                   │
│  │                  │  │                  │                   │
│  │  GPT-4o-mini     │  │  Claude Sonnet   │                   │
│  │  $0.15/1M tokens │  │  $3.00/1M tokens │                   │
│  │                  │  │                  │                   │
│  │  Use: Agents     │  │  Use: Tools      │                   │
│  │  (Conversation)  │  │  (Structured)    │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐                                          │
│  │    Anthropic     │                                          │
│  │                  │                                          │
│  │  Claude Haiku    │                                          │
│  │  $0.80/1M tokens │                                          │
│  │                  │                                          │
│  │  Use: Fast Tools │                                          │
│  │  (Quick Lookups) │                                          │
│  └──────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Recipe Request

```
USER: "I have chicken and rice, what can I cook?"
  │
  │ 1. User types message in Assistant-UI Thread
  │
  ▼
Assistant-UI Runtime
  │
  │ 2. useChatRuntime sends to API with agentName: "chefAgent"
  │
  ▼
POST /api/chat
  │
  │ 3. Extract: messages, threadId, agentName
  │ 4. Get chefAgent from Mastra
  │
  ▼
Chef Agent (GPT-4o-mini)
  │
  │ 5. Agent analyzes message with system instructions
  │ 6. Decides to use find_recipe tool
  │ 7. Calls tool with: { ingredients: ["chicken", "rice"] }
  │
  ▼
find_recipe Tool
  │
  │ 8. Builds prompt for recipe generation
  │ 9. Calls Claude Sonnet via generateObject
  │ 10. Validates output against Zod schema
  │
  ▼
Claude Sonnet (Anthropic)
  │
  │ 11. Generates structured recipe data
  │ 12. Returns: { recipes: [{ name, ingredients, ... }] }
  │
  ▼
Tool Result → Agent
  │
  │ 13. Agent formats response with recipe data
  │ 14. Streams response back to API
  │
  ▼
API Response Stream
  │
  │ 15. Returns: result.aisdk.v5.toUIMessageStreamResponse()
  │
  ▼
Assistant-UI Runtime
  │
  │ 16. Receives streaming response
  │ 17. Detects tool call in stream
  │ 18. Triggers RecipeToolUI component
  │
  ▼
RecipeToolUI Component
  │
  │ 19. Renders loading state (status: "running")
  │ 20. Receives result data
  │ 21. Renders recipe cards with animations
  │
  ▼
USER SEES: Beautiful recipe cards with ingredients and instructions
```

---

## Memory Flow: Conversation Persistence

```
SESSION 1:
User: "I have chicken"
  │
  ▼
API: agent.stream(messages, {
  memory: {
    thread: "user-123-session",  ← Thread ID
    resource: "user"              ← Resource ID
  }
})
  │
  ▼
Memory System (LibSQL):
┌─────────────────────────────────────┐
│ thread: user-123-session            │
│ resource: user                      │
│ messages: [                         │
│   { role: "user", content: "..." } │
│   { role: "assistant", content: ...}│
│ ]                                   │
│ timestamp: 2025-01-15T10:00:00Z     │
└─────────────────────────────────────┘

---

SESSION 2 (Later):
User: "What did I say I had?"
  │
  ▼
API: agent.stream(messages, {
  memory: {
    thread: "user-123-session",  ← SAME thread ID
    resource: "user"
  }
})
  │
  ▼
Memory System retrieves previous messages
  │
  ▼
Agent receives full context:
- Previous: "I have chicken"
- Current: "What did I say I had?"
  │
  ▼
Agent: "You mentioned you have chicken!"
```

---

## Agent Selection Flow

### Pattern: User-Selected Agent

```
1. USER INTERFACE
   ┌─────────────────────────────┐
   │  Agent Selector             │
   │  ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
   │  │👨‍🍳│ │🥗│ │📅│ │🍷│  │
   │  └───┘ └───┘ └───┘ └───┘  │
   │    ^                        │
   │    └─ User clicks "🥗"     │
   └─────────────────────────────┘
          │
          │ setSelectedAgent("nutritionExpert")
          ▼
2. REACT STATE UPDATE
   selectedAgent = "nutritionExpert"
          │
          │ Updates transport body
          ▼
3. CHAT RUNTIME
   useChatRuntime({
     transport: new AssistantChatTransport({
       api: "/api/chat",
       body: {
         agentName: "nutritionExpert" ← Passed here
       }
     })
   })
          │
          │ Next message includes agentName
          ▼
4. API ROUTE
   const { agentName } = await req.json()
   // agentName = "nutritionExpert"
          │
          │ Select agent
          ▼
5. MASTRA
   mastra.getAgent("nutritionExpert")
   // Returns Dr. Sarah (nutritionist)
          │
          │ Stream response
          ▼
6. RESPONSE
   Dr. Sarah's persona and expertise
   used for response
```

---

## Model Selection Strategy

```
TASK TYPE                    → MODEL CHOICE       → REASON
────────────────────────────────────────────────────────────
Agent Conversation           → GPT-4o-mini        → Fast & cheap
(Deciding what to do)          $0.15/1M tokens      orchestration

Tool Execution               → Claude Sonnet      → High quality
(Getting recipes)              $3.00/1M tokens      structured output

Quick Lookups                → Claude Haiku       → Speed + cost
(Simple nutrition info)        $0.80/1M tokens      balance

Complex Analysis             → Claude Opus        → Maximum quality
(Detailed meal planning)       $15.00/1M tokens     for important tasks

Advanced Reasoning           → o1-preview         → Step-by-step
(Multi-day meal optimization)  $15.00/1M tokens     reasoning
```

---

## Cost Optimization Example

### Before: Using Claude Opus for Everything

```
100 requests × 5 messages each
= 500 LLM calls
× ~2000 tokens average
= 1M tokens
× $15.00 per 1M tokens
= $15.00 per 100 users
```

### After: Optimized Model Selection

```
Agent Orchestration:
100 requests × 5 messages × 2000 tokens = 1M tokens
GPT-4o-mini: $0.15

Tool Execution (30% of messages):
100 requests × 1.5 tools × 3000 tokens = 0.45M tokens
Claude Sonnet: $1.35

Total: $1.50 per 100 users
Savings: 90% 💰
```

---

## File Structure

```
assistant/
├── app/
│   ├── assistant.tsx                    ← Main UI (single agent)
│   ├── assistant-with-agent-selector.tsx ← UI with selection
│   └── api/chat/
│       ├── route.ts                     ← Current API
│       └── route-with-agents.ts         ← Multi-agent API
│
├── components/assistant-ui/
│   ├── agent-selector.tsx               ← NEW: Agent picker UI
│   ├── thread.tsx                       ← Chat interface
│   ├── thread-list.tsx                  ← Thread history
│   └── tool-ui/
│       ├── recipe-tool-ui.tsx           ← Recipe cards
│       └── nutrition-tool-ui.tsx        ← Nutrition display
│
├── mastra/
│   ├── index.ts                         ← UPDATED: All agents
│   ├── models.ts                        ← NEW: Model config
│   ├── memory.ts                        ← Memory system
│   │
│   ├── agents/
│   │   ├── README.md                    ← NEW: Agent guide
│   │   ├── chefAgent.ts                 ← UPDATED: Enhanced
│   │   ├── nutritionExpertAgent.ts      ← NEW: Nutritionist
│   │   ├── mealPlannerAgent.ts          ← NEW: Meal planner
│   │   ├── sommelierAgent.ts            ← NEW: Wine expert
│   │   └── orchestratorAgent.ts         ← NEW: Router
│   │
│   └── tools/
│       └── recipeTools.ts               ← Recipe & nutrition tools
│
├── local.db                             ← NEW: SQLite database
│
└── Documentation:
    ├── CLAUDE.md                        ← Original project docs
    ├── MULTI_AGENT_GUIDE.md             ← NEW: Multi-agent patterns
    ├── ASSISTANT_UI_MULTI_AGENT_INTEGRATION.md ← NEW: Integration guide
    ├── ARCHITECTURE_VISUAL_GUIDE.md     ← NEW: This file
    └── IMPROVEMENTS_SUMMARY.md          ← NEW: What changed
```

---

## Quick Decision Tree

```
"Which pattern should I use?"

START
  │
  ▼
Do you need specialized expertise?
  │
  ├─ NO → Use Pattern 1: Single Agent (current)
  │        ✅ Simplest
  │        ✅ No changes needed
  │
  └─ YES
      │
      ▼
Should users control agent selection?
  │
  ├─ YES → Use Pattern 2: User-Selected
  │         ✅ Recommended for most apps
  │         ⏱️ 20 minute setup
  │
  └─ NO
      │
      ▼
Can you write good routing logic?
  │
  ├─ YES → Use Pattern 3: Auto-Routing
  │         ✅ Seamless UX
  │         ⏱️ 30 minute setup
  │
  └─ NO → Use Pattern 4: Orchestrator
           ⚠️ Most complex
           ⏱️ 1+ hour setup
```

---

## Summary

### System Components

1. **Frontend**: Assistant-UI (React)
2. **API**: Next.js API routes
3. **Backend**: Mastra (agent orchestration)
4. **Storage**: LibSQL (conversation memory)
5. **Models**: OpenAI + Anthropic

### Key Features

✅ **5 Specialized Agents** (chef, nutritionist, planner, sommelier, orchestrator)
✅ **3 Model Tiers** (fast, balanced, premium)
✅ **Persistent Memory** (SQLite-based storage)
✅ **Generative UI** (Tool-specific components)
✅ **Cost Optimized** (90% potential savings)

### Integration Points

1. **UI → API**: Transport with agent selection
2. **API → Mastra**: Agent retrieval and execution
3. **Mastra → Memory**: Conversation persistence
4. **Agent → Tools**: Model-powered tool execution
5. **Tools → UI**: Structured data rendering

---

**Next Step**: Read [ASSISTANT_UI_MULTI_AGENT_INTEGRATION.md](./ASSISTANT_UI_MULTI_AGENT_INTEGRATION.md) for implementation details!
