# Chef Assistant - AI Cooking Assistant with Generative UI

## Project Overview

This is a full-stack AI cooking assistant built with Next.js, Mastra AI framework, Anthropic Claude with web search, and Assistant-UI for generative UI components.

## Tech Stack

### Core Frameworks
- **Next.js 15.5.4** - React framework with App Router
- **Mastra AI 0.23.1** - TypeScript AI agent framework
- **Assistant-UI 0.11.34** - React components for AI chat interfaces
- **Anthropic Claude** - LLM with web search capabilities via API
- **AI SDK 5.0.79** - Vercel's AI SDK for streaming
- **Bun 1.2.2** - Fast JavaScript runtime and package manager

### UI & Styling
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### State & Memory
- **Zustand** - State management
- **@mastra/memory** - Conversation history persistence
- **@mastra/libsql** - SQLite-based storage for memory

## Architecture

### Data Flow

```
User Input (Assistant-UI)
  ↓
API Route (/app/api/chat/route.ts)
  ↓
Mastra Agent (with memory)
  ↓
LLM Call (GPT-4o-mini for agent, Claude with web search for tools)
  ↓
Tool Execution (Recipe finder, Nutrition info)
  ↓
Streaming Response
  ↓
Generative UI Components (Recipe cards, Nutrition display)
```

### Memory Integration

**How it works:**
1. **Assistant-UI** manages UI state and thread management
2. **Mastra Memory** persists conversation history in SQLite
3. **API Route** bridges the two by passing `threadId` and `resource` parameters
4. **Agent** retrieves past context from memory automatically

```typescript
// API Route extracts threadId
const { messages, threadId } = await req.json();

// Passes to agent with memory context
const result = await agent.stream(messages, {
  memory: {
    thread: threadId,
    resource: "user"
  }
});
```

### Agent Configuration

The chef agent (`mastra/agents/chefAgent.ts`) is configured with:
- **Instructions**: System prompt defining agent behavior
- **Model**: GPT-4o-mini for cost-effective responses
- **Tools**: Custom tools for recipe finding and nutrition info
- **Memory**: Enabled for conversation persistence

### Tools with Structured Output

Tools use **AI SDK's generateObject** with Anthropic Claude to return structured, validated data:

```typescript
// Using AI SDK for structured output
const result = await generateObject({
  model: anthropic("claude-sonnet-4-5-20250929"),
  schema: z.object({
    recipes: z.array(recipeSchema)
  }),
  prompt
});
```

**Benefits:**
- Type-safe structured output with Zod validation
- Consistent data format guaranteed
- No JSON parsing errors
- Faster response times

**Note on Web Search:**
While Anthropic's web search tool is powerful, it's not yet fully supported with structured output in AI SDK. The current implementation uses Claude's extensive training data on recipes and nutrition, which provides:
- Reliable recipe suggestions based on common ingredients
- Accurate nutritional estimates from training on USDA and nutrition databases
- Consistent structured output

**For Production Web Search:**
Consider implementing a RAG (Retrieval Augmented Generation) pipeline with:
- Recipe APIs (Spoonacular, Edamam, TheMealDB)
- Nutrition APIs (USDA FoodData Central, Nutritionix)
- Vector database for recipe search

### Generative UI

Custom UI components (`components/assistant-ui/tool-ui/`) render when tools are called:

- **RecipeToolUI**: Animated recipe cards with ingredients, instructions, difficulty
- **NutritionToolUI**: Nutritional information with color-coded nutrients

These components use `makeAssistantToolUI` from Assistant-UI to:
- Handle loading states
- Display results with animations
- Provide visual feedback

## Project Structure

```
assistant/
├── app/
│   ├── api/chat/route.ts         # API endpoint for chat
│   ├── assistant.tsx              # Main assistant component
│   ├── page.tsx                   # Home page
│   └── layout.tsx                 # Root layout
├── components/
│   ├── assistant-ui/
│   │   ├── tool-ui/              # Generative UI components
│   │   │   ├── recipe-tool-ui.tsx
│   │   │   └── nutrition-tool-ui.tsx
│   │   ├── thread.tsx            # Chat thread component
│   │   └── thread-list.tsx       # Thread list sidebar
│   └── ui/                       # Shared UI components
├── mastra/
│   ├── agents/
│   │   └── chefAgent.ts          # Chef agent definition
│   ├── tools/
│   │   └── recipeTools.ts        # Recipe & nutrition tools
│   ├── memory.ts                 # Memory configuration
│   └── index.ts                  # Mastra instance
├── lib/
│   └── utils.ts                  # Utility functions
└── local.db                      # SQLite database (auto-created)
```

## Environment Variables

**⚠️ IMPORTANT**: The app requires API keys to function. Copy the example file and add your keys:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your API keys
```

Required keys in `.env.local`:

```bash
# Required for Anthropic Claude web search (used by tools)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...

# Required for OpenAI (main agent model)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Optional: LibSQL/Turso for distributed storage
LIBSQL_URL=file:local.db
# LIBSQL_AUTH_TOKEN=your_turso_token_here
```

**Without these keys, the app will fail with authentication errors.**

## Getting Started

### Installation

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY and OPENAI_API_KEY

# 3. Run development server
bun run dev

# Build for production (optional)
bun run build

# Start production server (optional)
bun start
```

**Note**: You must add your API keys in `.env.local` before running the app, or it will fail with authentication errors.

### Testing the App

1. **Start the dev server**: `bun run dev`
2. **Open**: http://localhost:3000
3. **Try these prompts**:
   - "I have chicken, rice, and broccoli. What can I cook?"
   - "Find me a vegetarian pasta recipe"
   - "What's the nutritional info for Greek salad?"

## Testing Strategy

### Recommended Testing Approach

#### 1. Unit Tests (Jest + Testing Library)

Install:
```bash
bun add -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

Test files structure:
```
__tests__/
├── components/
│   └── tool-ui/
│       ├── recipe-tool-ui.test.tsx
│       └── nutrition-tool-ui.test.tsx
├── mastra/
│   └── tools/
│       └── recipeTools.test.ts
└── api/
    └── chat.test.ts
```

Example test:
```typescript
// __tests__/components/tool-ui/recipe-tool-ui.test.tsx
import { render, screen } from '@testing-library/react';
import { RecipeToolUI } from '@/components/assistant-ui/tool-ui/recipe-tool-ui';

describe('RecipeToolUI', () => {
  it('displays loading state', () => {
    render(<RecipeToolUI status={{ type: 'running' }} />);
    expect(screen.getByText(/Finding recipes/i)).toBeInTheDocument();
  });
});
```

#### 2. Integration Tests (Playwright)

Install:
```bash
bun add -D @playwright/test
```

Test end-to-end flows:
```typescript
// e2e/chef-assistant.spec.ts
import { test, expect } from '@playwright/test';

test('user can get recipe suggestions', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('textarea', 'I have chicken and rice');
  await page.click('[data-testid="send-button"]');
  await expect(page.locator('.recipe-card')).toBeVisible({ timeout: 10000 });
});
```

#### 3. Tool Tests (Vitest)

Test Mastra tools in isolation:
```typescript
// mastra/tools/__tests__/recipeTools.test.ts
import { describe, it, expect } from 'vitest';
import { findRecipeTool } from '../recipeTools';

describe('findRecipeTool', () => {
  it('returns structured recipe data', async () => {
    const result = await findRecipeTool.execute({
      context: {
        ingredients: ['chicken', 'rice'],
        cuisine: 'Asian',
      }
    });

    expect(result.recipes).toBeDefined();
    expect(result.recipes).toHaveLength(2);
    expect(result.recipes[0]).toHaveProperty('name');
    expect(result.recipes[0]).toHaveProperty('ingredients');
  });
});
```

#### 4. Memory Tests

Test conversation persistence:
```typescript
// __tests__/mastra/memory.test.ts
import { memory } from '@/mastra/memory';

describe('Memory', () => {
  it('persists conversation history', async () => {
    const threadId = 'test-thread-123';

    // Save message
    await memory.saveMessages({
      messages: [{ role: 'user', content: 'Hello' }],
      threadId,
    });

    // Retrieve messages
    const history = await memory.getHistory({ threadId });
    expect(history).toHaveLength(1);
  });
});
```

## Key Concepts

### 1. Streaming with Structured Output

The tools use `streamObject` from AI SDK to stream structured data:
- Provides type safety with Zod schemas
- Enables progressive rendering in UI
- Validates output against schema

### 2. Web Search Integration

Anthropic Claude's web search tool:
- Type: `web_search_20250305`
- Pricing: $10 per 1,000 searches + token costs
- Benefits: Real-time data, source citations
- Max uses: Configurable per request

### 3. Memory Architecture

**Thread**: Represents a conversation session
**Resource**: Represents a user or entity
**Storage**: LibSQL (local) or Turso (distributed)

Messages are automatically:
- Stored after each interaction
- Retrieved before agent calls
- Used as context for responses

### 4. Generative UI Pattern

**makeAssistantToolUI** creates UI components that:
- Render based on tool execution state
- Receive tool args and results as props
- Handle loading, error, and success states
- Integrate with assistant-ui context

## Common Patterns

### Adding a New Tool

1. **Define the tool** (`mastra/tools/yourTool.ts`):
```typescript
export const yourTool = createTool({
  id: "your_tool",
  description: "What your tool does",
  inputSchema: z.object({
    param: z.string()
  }),
  outputSchema: z.object({
    result: z.string()
  }),
  execute: async ({ context }) => {
    // Implementation
    return { result: "value" };
  }
});
```

2. **Add to agent** (`mastra/agents/chefAgent.ts`):
```typescript
tools: {
  your_tool: yourTool,
}
```

3. **Create UI component** (`components/assistant-ui/tool-ui/your-tool-ui.tsx`):
```typescript
export const YourToolUI = makeAssistantToolUI({
  toolName: "your_tool",
  render: ({ args, result, status }) => {
    // Handle loading state
    if (status.type === "running") {
      return (
        <div className="loading-state">
          {args?.param && <span>Processing {args.param}...</span>}
        </div>
      );
    }

    // Safety check for result
    if (!result) {
      return null;
    }

    // Render result
    return <div>{result.data}</div>;
  }
});
```
**Important**: Always use optional chaining (`args?.property`) when accessing args to prevent runtime errors!

4. **Register in assistant** (`app/assistant.tsx`):
```typescript
<AssistantRuntimeProvider runtime={runtime}>
  <YourToolUI />
  {/* ... */}
</AssistantRuntimeProvider>
```

### Customizing Agent Behavior

Edit `mastra/agents/chefAgent.ts`:
- **Instructions**: Change system prompt
- **Model**: Switch LLM provider
- **Tools**: Add/remove capabilities
- **Memory**: Configure persistence

### Managing State

**UI State**: Assistant-UI Context API
```typescript
const { messages } = useAssistantState();
const { sendMessage } = useAssistantApi();
```

**Conversation Memory**: Mastra Memory (automatic)

## Performance Considerations

1. **Model Selection**:
   - Agent: GPT-4o-mini (fast, cost-effective)
   - Tools: Claude 3.5 Sonnet (web search, high-quality)

2. **Memory**:
   - LibSQL for local dev (file-based)
   - Turso for production (distributed, replicated)

3. **Streaming**:
   - Progressive rendering of responses
   - Tool results stream as they're generated

4. **Caching**:
   - Claude supports prompt caching (reduce costs)
   - Assistant-UI caches thread state

## Troubleshooting

### Build Errors

**Type errors with UI components**:
- Solution: Ensure using bun (not pnpm/npm)
- Bun has better React 19 type compatibility

**Mastra telemetry warnings**:
- These are informational only
- Can be disabled by setting env var
- Will be removed in future Mastra versions

### Runtime Issues

**"Cannot read properties of undefined" in Tool UI**:
- **Error**: `Cannot read properties of undefined (reading 'join')` or similar
- **Cause**: Tool UI components try to access `args` properties before they're populated
- **Solution**: Always use optional chaining when accessing args:
  ```typescript
  // ❌ Bad - will crash if args is undefined
  {args.ingredients.join(", ")}

  // ✅ Good - safe access
  {args?.ingredients && args.ingredients.join(", ")}
  ```
- **Best Practice**: Check all nested properties in Tool UI render functions:
  - Check `args?.propertyName` before accessing
  - Check `result` exists before rendering
  - Check array lengths before mapping

**Web search not working**:
- Verify `ANTHROPIC_API_KEY` is set
- Check model supports web search (Sonnet/Haiku/Opus)
- Ensure using correct tool type: `web_search_20250305`

**Memory not persisting**:
- Check `local.db` file is created
- Verify agent has `memory` configured
- Ensure `threadId` is passed in API route

**Tools not being called**:
- Check tool descriptions are clear
- Verify tools are added to agent
- Test with explicit prompts that require tools

## Future Enhancements

1. **Real Web Search with RAG**: Implement retrieval augmented generation with recipe APIs
   ```typescript
   // Example with Spoonacular API
   const recipes = await fetch(
     `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&apiKey=${process.env.SPOONACULAR_API_KEY}`
   );

   // Then use Claude to format and present the results
   const formatted = await generateObject({
     model: anthropic("claude-sonnet-4-5"),
     schema: recipeSchema,
     prompt: `Format these recipes: ${JSON.stringify(recipes)}`
   });
   ```

2. **User Authentication**: Add auth to track users by resource ID
3. **Image Generation**: Add DALL-E for food imagery
4. **Voice Input**: Integrate speech-to-text
5. **Recipe Saving**: Allow users to save favorite recipes
6. **Shopping Lists**: Generate ingredient shopping lists
7. **Meal Planning**: Multi-day meal planning tool
8. **Dietary Profiles**: Store user dietary preferences in memory

## Resources

- [Mastra Documentation](https://mastra.ai/en/docs)
- [Assistant-UI Docs](https://www.assistant-ui.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [AI SDK Documentation](https://ai-sdk.dev/)
- [Next.js 15 Docs](https://nextjs.org/docs)

## License

MIT

## Support

For issues or questions:
1. Check this documentation
2. Review framework docs
3. Check GitHub issues for the respective frameworks
