# Troubleshooting Guide

## Common Runtime Errors

### 1. "Cannot read properties of undefined" in Tool UI

**Error Message:**
```
Runtime TypeError
Cannot read properties of undefined (reading 'join')
```

**Location:**
Tool UI components (e.g., `recipe-tool-ui.tsx`, `nutrition-tool-ui.tsx`)

**Root Cause:**
Tool UI components are rendered immediately when a tool is called, but the `args` parameter may not be fully populated yet. This causes errors when trying to access properties like `args.ingredients.join()`.

**Solution:**
Always use optional chaining and null checks when accessing args and nested properties:

```typescript
// ❌ WRONG - Will crash
export const MyToolUI = makeAssistantToolUI({
  toolName: "my_tool",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return <div>{args.ingredients.join(", ")}</div>; // ERROR!
    }
    // ...
  }
});

// ✅ CORRECT - Safe access
export const MyToolUI = makeAssistantToolUI({
  toolName: "my_tool",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div>
          {args?.ingredients && args.ingredients.join(", ")}
        </div>
      );
    }
    // ...
  }
});
```

**Best Practices for Tool UI:**

1. **Always check args before access:**
   ```typescript
   {args?.propertyName && <div>{args.propertyName}</div>}
   ```

2. **Check result exists:**
   ```typescript
   if (!result || !result.data) {
     return null;
   }
   ```

3. **Check array lengths:**
   ```typescript
   if (!result.recipes || result.recipes.length === 0) {
     return null;
   }
   ```

4. **Wrap nested array access:**
   ```typescript
   {recipe.ingredients && recipe.ingredients.length > 0 && (
     <ul>
       {recipe.ingredients.map((item, i) => (
         <li key={i}>{item}</li>
       ))}
     </ul>
   )}
   ```

### 2. "No JSON found in response" Error

**Error Message:**
```
Error: No JSON found in response
at execute (mastra/tools/recipeTools.ts:106:13)
```

**Cause:**
Claude's web search responses include citations and sources in a complex format that can't be parsed as simple JSON.

**Solution (Already Fixed):**
The tools now use `generateObject` from AI SDK for structured output instead of manual JSON parsing:

```typescript
// ✅ Now using generateObject
const result = await generateObject({
  model: anthropic("claude-sonnet-4-5-20250929"),
  schema: z.object({ recipes: z.array(recipeSchema) }),
  prompt
});

// ❌ Old approach - tried to parse JSON from text
const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
const parsed = JSON.parse(jsonMatch[0]);  // Would fail
```

**Note:** Current implementation uses Claude's training data rather than live web search, which is more reliable and provides consistent structured output.

### 3. Memory Not Persisting

**Symptoms:**
- Agent doesn't remember previous conversations
- Each message starts fresh

**Solutions:**

1. **Check Database File:**
   ```bash
   ls -la local.db  # Should exist in project root
   ```

2. **Verify Memory Configuration:**
   ```typescript
   // mastra/agents/chefAgent.ts
   import { memory } from "../memory";

   export const chefAgent = new Agent({
     // ...
     memory,  // Must be included
   });
   ```

3. **Ensure ThreadID is Passed:**
   ```typescript
   // app/api/chat/route.ts
   const { messages, threadId } = await req.json();

   const result = await agent.stream(messages, {
     memory: {
       thread: threadId,      // Required
       resource: "user"
     }
   });
   ```

### 4. Build Errors

**Type Errors with Radix UI Components:**
```
Type '{ popover: "hint" }' is not assignable to type 'SlotProps'
```

**Solution:**
Use Bun instead of npm/pnpm. Bun has better React 19 type compatibility.

```bash
# Remove old packages
rm -rf node_modules pnpm-lock.yaml package-lock.json

# Install with bun
bun install
```

### 5. Agent Not Calling Tools

**Symptoms:**
- Agent responds without using tools
- Tools are defined but never executed

**Debugging Steps:**

1. **Check Tool Description:**
   - Must be clear and specific
   - Should explain when to use the tool
   ```typescript
   // ❌ Vague
   description: "Get info"

   // ✅ Clear
   description: "Search the web for real recipes based on available ingredients. Returns actual recipe suggestions from online sources."
   ```

2. **Check Tool Registration:**
   ```typescript
   // Agent must have tools
   export const agent = new Agent({
     tools: {
       find_recipe: findRecipeTool,  // Must match tool ID
     }
   });
   ```

3. **Use Explicit Prompts:**
   ```typescript
   // ❌ Vague request
   "I have chicken"

   // ✅ Clear trigger
   "Find recipes using chicken, rice, and broccoli"
   ```

### 6. Streaming Issues

**Symptoms:**
- Long delays before response
- UI freezes during tool execution

**Solutions:**

1. **Verify Streaming is Enabled:**
   ```typescript
   // ✅ Correct - uses stream
   const result = await agent.stream(messages);

   // ❌ Wrong - uses generate (blocking)
   const result = await agent.generate(messages);
   ```

2. **Check Response Type:**
   ```typescript
   // Must convert to UI stream
   return result.aisdk.v5.toUIMessageStreamResponse();
   ```

## Getting Help

1. **Check Logs:**
   ```bash
   bun run dev
   # Check terminal for errors
   ```

2. **Verify Environment:**
   ```bash
   cat .env.local
   # Ensure all required keys are set
   ```

3. **Test Components:**
   ```bash
   # Run in isolation
   bun test components/assistant-ui/tool-ui/
   ```

4. **Check Framework Docs:**
   - [Mastra Docs](https://mastra.ai/en/docs)
   - [Assistant-UI Docs](https://www.assistant-ui.com/docs)
   - [Anthropic API Docs](https://docs.anthropic.com/)

## Debug Mode

Enable verbose logging:

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, threadId } = await req.json();

  console.log("Request:", { messages, threadId });  // Debug

  const result = await agent.stream(messages, {
    memory: { thread: threadId, resource: "user" }
  });

  console.log("Agent result:", result);  // Debug

  return result.aisdk.v5.toUIMessageStreamResponse();
}
```

## Performance Issues

**Slow Response Times:**

1. **Use Faster Models:**
   - GPT-4o-mini instead of GPT-4
   - Claude Haiku instead of Sonnet

2. **Limit Web Searches:**
   ```typescript
   tools: [{
     type: "web_search_20250305",
     max_uses: 3  // Lower = faster
   }]
   ```

3. **Enable Caching:**
   ```typescript
   model: anthropic("claude-3-5-sonnet-20241022"),
   experimental_providerMetadata: {
     anthropic: {
       cacheControl: true  // Cache prompts
     }
   }
   ```
