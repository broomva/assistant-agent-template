# Agents Best Practices Audit

## Overview

This document audits all agents against Mastra official patterns from the docs and examples.

**Reference**: Mastra `memory-per-resource-example` and official agent documentation

---

## ✅ What We're Doing Right

### 1. Core Agent Structure
All agents follow the correct pattern:

```typescript
export const agentName = new Agent({
  name: "agent-name",
  instructions: "...",
  model: someModel,
  tools: { ... },
  memory,
});
```

✅ **Correct!** This matches official Mastra patterns exactly.

### 2. Memory Configuration
```typescript
// memory.ts
export const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
});
```

✅ **Correct!** Simple, persistent storage with Turso support.

### 3. Model Selection Strategy
Using centralized model configuration for cost optimization:

```typescript
model: defaultModels.agent // GPT-4o-mini for agents
```

✅ **Good Practice!** Centralized and documented.

### 4. Tool Registration
```typescript
tools: {
  find_recipe: findRecipeTool,
  get_nutritional_info: getNutritionalInfoTool,
}
```

✅ **Correct!** Clear naming and proper imports.

---

## ⚠️ Potential Improvements

### 1. Working Memory (Optional but Powerful)

**What the official example shows:**
```typescript
export const memory = new Memory({
  storage,
  options: {
    lastMessages: 5,
    workingMemory: {
      enabled: true,
      scope: 'resource', // ← Key feature!
      template: `# User Profile
- **Name**:
- **Location**:
- **Interests**:
- **Preferences**:
- **Goals**:
- **Important Notes**:
`,
    },
  },
});
```

**What we have:**
```typescript
// No working memory configuration
export const memory = new Memory({
  storage: new LibSQLStore({ ... })
});
```

**Impact**:
- Without working memory, agents only remember last 5 messages
- With working memory, agents maintain persistent user profiles across ALL threads
- Resource-scoped means profiles stay with users, not conversations

**Should we add it?**
- ✅ YES for production (huge UX improvement)
- ⚠️ Optional for MVP (adds complexity)
- 📊 Trade-off: Better memory vs. more LLM calls for updates

---

### 2. Model Reference Style

**Official Mastra pattern:**
```typescript
// Direct model reference
model: openai('gpt-4o-mini')
```

**Our pattern:**
```typescript
// Abstracted through defaultModels
model: defaultModels.agent
```

**Analysis:**
- ✅ Our approach: Better for cost optimization
- ✅ Official approach: More direct, less abstraction
- ✅ **Both are valid!** Ours is actually more maintainable

**Verdict**: Keep our pattern - it's better for managing costs at scale.

---

### 3. Orchestrator Agent Tools

**Current:**
```typescript
tools: {}, // Empty object
```

**Better:**
```typescript
// Option 1: Remove empty tools
// (tools property is optional)

// Option 2: Actually delegate to other agents
// (advanced - requires agent-to-agent calling)
```

**Verdict**: Empty `tools: {}` is harmless but unnecessary. Remove or add actual routing tools.

---

### 4. Instructions Length

**Our orchestrator:**
```typescript
instructions: `... 60+ lines of detailed routing instructions ...`
```

**Official examples:**
```typescript
instructions: `... concise, focused instructions ...`
```

**Analysis:**
- Long instructions can work but may:
  - Increase token usage
  - Slow response times
  - Make updates harder

**Verdict**: Consider shortening, but test first - longer might work better for your use case!

---

## 🎯 Recommendations

### Priority 1: Add Working Memory (High Impact)

**Why**: Transforms user experience from "stateless" to "remembers me"

**How**: Update `memory.ts`:

```typescript
export const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
  options: {
    lastMessages: 10, // Keep more context
    workingMemory: {
      enabled: true,
      scope: 'resource', // User-scoped, not thread-scoped
      template: `# Chef Assistant User Profile

## Personal Info
- **Name**:
- **Dietary Restrictions**:
- **Cuisine Preferences**:
- **Cooking Skill Level**:

## Past Conversations
- **Favorite Recipes**:
- **Ingredients Often Used**:
- **Health Goals**:
- **Special Notes**:
`,
    },
  },
});
```

**Impact**:
- Agents remember users across all conversations
- Personalized recommendations
- Better long-term engagement

---

### Priority 2: Clean Up orchestratorAgent (Low Impact)

**Option A: Remove Empty Tools**
```typescript
export const orchestratorAgent = new Agent({
  name: "orchestrator",
  instructions: `...`,
  model: defaultModels.agent,
  memory,
  // No tools property - it's optional
});
```

**Option B: Shorten Instructions**
```typescript
instructions: `You are a chef assistant coordinator.

Route users to:
- Michel (chef-agent): Recipes, cooking
- Dr. Sarah (nutrition-expert): Nutrition, health
- Emma (meal-planner): Weekly planning
- Jean-Pierre (sommelier): Wine pairings

Be warm, helpful, and concise.`
```

---

### Priority 3: Consider Direct Model References (Optional)

**Current:**
```typescript
import { defaultModels } from "../models";
model: defaultModels.agent
```

**Alternative:**
```typescript
import { openai } from "@ai-sdk/openai";
model: openai("gpt-4o-mini")
```

**Verdict**: Keep current approach - centralized control is better.

---

## Agent-by-Agent Review

### ✅ chefAgent.ts
- **Structure**: Perfect ✅
- **Instructions**: Clear and appropriate ✅
- **Tools**: Properly configured ✅
- **Memory**: Correct ✅
- **Model**: Good choice (GPT-4o-mini) ✅

**Verdict**: No changes needed

---

### ✅ nutritionExpertAgent.ts
- **Structure**: Perfect ✅
- **Instructions**: Domain-focused ✅
- **Tools**: Correct (nutrition tool only) ✅
- **Memory**: Shared correctly ✅
- **Model**: Appropriate ✅

**Verdict**: No changes needed

---

### ✅ mealPlannerAgent.ts
- **Structure**: Perfect ✅
- **Instructions**: Clear scope ✅
- **Tools**: Both tools (recipe + nutrition) ✅
- **Memory**: Correct ✅
- **Model**: Good ✅

**Verdict**: No changes needed

---

### ✅ sommelierAgent.ts
- **Structure**: Perfect ✅
- **Instructions**: Expert persona ✅
- **Tools**: Custom wine pairing tool ✅
- **Memory**: Correct ✅
- **Model**: Appropriate ✅

**Verdict**: No changes needed

---

### ⚠️ orchestratorAgent.ts
- **Structure**: Correct ✅
- **Instructions**: Very detailed ⚠️ (could be shorter)
- **Tools**: Empty object ⚠️ (unnecessary)
- **Memory**: Correct ✅
- **Model**: Good ✅

**Recommendations**:
1. Remove `tools: {}` (optional property)
2. Consider shortening instructions
3. Test shorter vs longer instructions

---

## Comparison with Official Examples

| Aspect | Our Implementation | Official Pattern | Verdict |
|--------|-------------------|------------------|---------|
| Agent Structure | ✅ Correct | ✅ Same | Perfect match |
| Memory Storage | ✅ LibSQL | ✅ LibSQL | Perfect match |
| Working Memory | ❌ Not configured | ✅ Configured | Should add |
| Model Selection | ✅ Abstracted | ⚠️ Direct strings | Ours is better |
| Tool Registration | ✅ Correct | ✅ Same | Perfect match |
| Instructions | ⚠️ Verbose | ✅ Concise | Could improve |

---

## Implementation Plan

### Phase 1: Add Working Memory (Recommended)

```bash
# Update memory.ts with working memory config
# Test with multiple users
# Observe how agents build profiles
```

**Time**: 15 minutes
**Impact**: High (transforms UX)
**Risk**: Low (optional feature)

---

### Phase 2: Clean Up Orchestrator (Optional)

```bash
# Remove empty tools
# Test shorter instructions
# Compare performance
```

**Time**: 10 minutes
**Impact**: Low (minor cleanup)
**Risk**: Minimal

---

### Phase 3: Monitor & Optimize (Ongoing)

```bash
# Track working memory effectiveness
# Monitor token usage
# Adjust lastMessages count
# Refine working memory template
```

**Time**: Ongoing
**Impact**: Medium (iterative improvement)
**Risk**: None

---

## Final Verdict

### ✅ Current State: Very Good

Your agents follow Mastra best practices almost perfectly. The structure is solid, patterns are correct, and the multi-agent architecture is well-designed.

### 🎯 Key Opportunity: Working Memory

The ONE major feature from official examples we're missing is **working memory**. This would:

- ✅ Make agents remember users across threads
- ✅ Enable personalized recommendations
- ✅ Improve long-term engagement
- ✅ Create better user experience

**Recommendation**: Add working memory configuration to `memory.ts`.

### 🔧 Minor Cleanups

- Remove `tools: {}` from orchestrator (optional property)
- Consider shorter orchestrator instructions (test first!)
- Keep everything else as-is

---

## Code Examples

### Enhanced memory.ts (Recommended)

```typescript
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
  options: {
    // Keep more context than default (5)
    lastMessages: 10,

    // Enable working memory for user profiles
    workingMemory: {
      enabled: true,
      scope: 'resource', // Persists across all threads for same user
      template: `# Chef Assistant User Profile

## Personal Details
- **Name**:
- **Dietary Restrictions**:
- **Allergens**:

## Preferences
- **Favorite Cuisines**:
- **Cooking Skill Level**:
- **Available Cooking Time**:

## History & Context
- **Frequently Requested Recipes**:
- **Ingredient Preferences**:
- **Health & Nutrition Goals**:
- **Special Occasions**:

## Important Notes
-
`,
    },
  },
});
```

### Simplified orchestratorAgent.ts (Optional)

```typescript
export const orchestratorAgent = new Agent({
  name: "orchestrator",
  instructions: `You coordinate a team of culinary experts:

- **Michel** (chef-agent): Recipes & cooking
- **Dr. Sarah** (nutrition-expert): Nutrition & health
- **Emma** (meal-planner): Weekly meal planning
- **Jean-Pierre** (sommelier): Wine pairings

Analyze user questions and guide them to the right specialist. Be warm and helpful.`,

  model: defaultModels.agent,
  memory,
  // tools property removed - optional when empty
});
```

---

## Summary

**Current Score**: 9/10

**With Working Memory**: 10/10

Your implementation is excellent and follows Mastra patterns correctly. The only significant enhancement would be adding working memory for persistent user profiles across conversations.

Everything else is either perfect or a matter of preference!
