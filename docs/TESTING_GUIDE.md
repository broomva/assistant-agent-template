# Testing Guide: Multi-Agent Setup

## Quick Start

### 1. Start the Dev Server

```bash
bun run dev
```

Expected output:
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000

✓ Starting...
✓ Ready in 2.3s
```

### 2. Open in Browser

Visit: http://localhost:3000

You should see:
- ✅ Agent selector in top-right (dropdown with agents)
- ✅ Thread list on the left
- ✅ Chat interface in center
- ✅ Welcome message

---

## Testing Agent Switching (Browser)

### Test 1: Default Chef Agent

1. **Click** agent selector
2. **Select**: 👨‍🍳 Chef Michel
3. **Type**: "I have chicken and rice, what can I cook?"
4. **Expect**: Recipe suggestions with find_recipe tool

### Test 2: Nutrition Expert

1. **Click** agent selector
2. **Select**: 🥗 Dr. Sarah
3. **Type**: "How many calories are in a Caesar salad?"
4. **Expect**: Nutritional information with different persona

### Test 3: Meal Planner

1. **Click** agent selector
2. **Select**: 📅 Emma
3. **Type**: "Help me plan meals for this week"
4. **Expect**: Weekly meal planning approach

### Test 4: Sommelier

1. **Click** agent selector
2. **Select**: 🍷 Jean-Pierre
3. **Type**: "What wine pairs with grilled salmon?"
4. **Expect**: Wine pairing recommendations

### Test 5: Memory Persistence

1. **Chat** with chef: "I'm vegetarian"
2. **Start new thread** (click "New Thread")
3. **Ask**: "What can I cook tonight?"
4. **Expect**: Should remember vegetarian preference

---

## Testing Agent Switching (API)

### Using the Test Script

```bash
# In a new terminal (keep dev server running)
./test-agents.sh
```

This will test all agents via curl requests.

### Manual API Testing

#### Test 1: Chef Agent
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "chefAgent",
    "threadId": "test-thread-1",
    "messages": [
      {"role": "user", "content": "I have chicken"}
    ]
  }'
```

#### Test 2: Nutrition Expert
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "nutritionExpert",
    "threadId": "test-thread-2",
    "messages": [
      {"role": "user", "content": "Calories in pasta?"}
    ]
  }'
```

#### Test 3: Meal Planner
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "mealPlanner",
    "threadId": "test-thread-3",
    "messages": [
      {"role": "user", "content": "Plan my meals"}
    ]
  }'
```

#### Test 4: Sommelier
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "sommelier",
    "threadId": "test-thread-4",
    "messages": [
      {"role": "user", "content": "Wine for salmon?"}
    ]
  }'
```

---

## Testing Memory Persistence

### Test: Same Thread, Different Requests

```bash
# Request 1: Tell agent something
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "chefAgent",
    "threadId": "memory-test-123",
    "messages": [
      {"role": "user", "content": "I am vegetarian"}
    ]
  }'

# Request 2: Check if it remembers (same threadId!)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "chefAgent",
    "threadId": "memory-test-123",
    "messages": [
      {"role": "user", "content": "I am vegetarian"},
      {"role": "assistant", "content": "Great! I can help with vegetarian recipes..."},
      {"role": "user", "content": "What should I cook tonight?"}
    ]
  }'

# Expected: Agent should suggest vegetarian options
```

### Test: Cross-Thread Memory (With Working Memory)

If you've enabled working memory (`memory-enhanced.ts`):

```bash
# Thread 1: Tell agent your name
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "thread-1",
    "messages": [
      {"role": "user", "content": "My name is Alex"}
    ]
  }'

# Thread 2: New conversation (different threadId, same resource)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "thread-2",
    "messages": [
      {"role": "user", "content": "Do you remember me?"}
    ]
  }'

# Expected: Agent should remember "Alex" from working memory
```

---

## Monitoring

### Check Console Logs

In your dev server terminal, you should see:

```
[Chat API] Agent: chefAgent, Thread: thread-1234567890
[Chat API] Agent: nutritionExpert, Thread: thread-9876543210
[Chat API] Agent: mealPlanner, Thread: thread-5555555555
```

This confirms agents are being switched correctly.

### Check Database

Memory is stored in `local.db` (SQLite):

```bash
# Install sqlite3 if needed
# brew install sqlite3 (macOS)
# apt-get install sqlite3 (Linux)

# View tables
sqlite3 local.db ".tables"

# View memory entries
sqlite3 local.db "SELECT * FROM mastra_memory LIMIT 5;"

# Check working memory (if enabled)
sqlite3 local.db "SELECT * FROM mastra_working_memory LIMIT 5;"
```

---

## Expected Behaviors

### Agent Personas

Each agent should respond with their distinct personality:

| Agent | Persona | Typical Response Style |
|-------|---------|------------------------|
| 👨‍🍳 Chef | Michel - warm, practical | "Great ingredients! Let me find some recipes..." |
| 🥗 Nutritionist | Dr. Sarah - educational | "Let me look up the nutritional information..." |
| 📅 Planner | Emma - organized | "I'd love to help plan your week..." |
| 🍷 Sommelier | Jean-Pierre - sophisticated | "Excellent choice! For salmon, I recommend..." |
| 🎯 Orchestrator | Coordinator | "For recipes, Michel can help! For nutrition..." |

### Tool Execution

When agents use tools, you should see:

**In Browser:**
- Loading state: "Finding recipes with your ingredients..."
- Result: Animated recipe cards or nutrition display

**In Console:**
- Tool calls logged
- Model usage (GPT-4o-mini for agent, Claude Sonnet for tools)

---

## Troubleshooting

### Problem: Agent selector not showing

**Check:**
```typescript
// app/assistant.tsx should import
import { AgentSelector } from "@/components/assistant-ui/agent-selector";

// And render it
<AgentSelector selectedAgent={selectedAgent} onAgentChange={setSelectedAgent} />
```

### Problem: All agents respond the same

**Check:**
```typescript
// API route should use selected agent
const agent = mastra.getAgent(agentName); // Not hardcoded "chefAgent"
```

**Debug:**
```bash
# Check console logs
# Should show: [Chat API] Agent: nutritionExpert
# NOT always: [Chat API] Agent: chefAgent
```

### Problem: Memory not persisting

**Check:**
1. `local.db` file exists in project root
2. Same `threadId` used across requests
3. Console shows no memory errors

**Debug:**
```bash
# Check database
sqlite3 local.db "SELECT COUNT(*) FROM mastra_memory;"
# Should be > 0 after chatting
```

### Problem: TypeScript errors

**Check:**
```bash
# Run type check
bun run build

# Should succeed with no errors
```

### Problem: API returns 404

**Check:**
1. Agent names are correct (case-sensitive!)
2. Agents are registered in `mastra/index.ts`
3. No typos in agent names

**Valid agent names:**
- `chefAgent`
- `nutritionExpert`
- `mealPlanner`
- `sommelier`
- `orchestrator`

---

## Success Criteria

✅ **Build succeeds** - No TypeScript errors
✅ **All agents accessible** - Each agent responds differently
✅ **Memory persists** - Same thread remembers context
✅ **Tools execute** - Recipe/nutrition tools work
✅ **UI updates** - Agent selector changes behavior
✅ **Logs show** - Different agents being used

---

## Performance Monitoring

### Token Usage

Watch console for model calls:
- Agent conversation: `gpt-4o-mini` (~$0.15/1M tokens)
- Tool execution: `claude-sonnet` (~$3/1M tokens)

### Response Times

Expected:
- Simple message: ~1-2 seconds
- With tool call: ~3-5 seconds
- Complex query: ~5-10 seconds

### Memory Operations

Database writes happen after each message:
- Message saved to `mastra_memory` table
- Working memory updated (if enabled)
- Check `local.db` size growth

---

## Next Steps

After successful testing:

1. **Enable working memory** (optional)
   ```bash
   mv mastra/memory.ts mastra/memory-basic.ts
   mv mastra/memory-enhanced.ts mastra/memory.ts
   ```

2. **Add more agents** (optional)
   - Copy existing agent file
   - Customize instructions and tools
   - Register in `mastra/index.ts`

3. **Customize UI** (optional)
   - Style agent selector
   - Add agent info cards
   - Create agent-specific themes

4. **Deploy** (when ready)
   - Build: `bun run build`
   - Deploy to Vercel/Netlify
   - Use Turso for distributed memory

---

## Quick Reference

### Start Dev Server
```bash
bun run dev
```

### Test All Agents
```bash
./test-agents.sh
```

### Check Database
```bash
sqlite3 local.db ".tables"
sqlite3 local.db "SELECT * FROM mastra_memory;"
```

### View Logs
```bash
# In dev server terminal
# Look for: [Chat API] Agent: ...
```

### Build for Production
```bash
bun run build
bun start
```

---

## Support

If you encounter issues:

1. Check this guide first
2. Review `BEST_PRACTICES_SUMMARY.md`
3. Check `OFFICIAL_PATTERNS_ANALYSIS.md`
4. Review Mastra docs: https://mastra.ai/en/docs
5. Review Assistant-UI docs: https://assistant-ui.com/docs

Happy testing! 🚀
