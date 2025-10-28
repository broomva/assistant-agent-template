# Example Files

These are reference implementations and alternative patterns created during development.

## Files in this directory

### Frontend Examples

**assistant-simple.tsx**
- Simplified version using official patterns
- 58% less code than complex version
- Good reference for minimal setup

**assistant-with-agent-selector.tsx**
- Full-featured version with three layout variants
- Shows different UI patterns for agent selection
- More verbose but well-documented

### API Route Examples

**route-simple.ts**
- Minimal implementation (15 lines)
- Official Mastra pattern
- No validation, trusts framework

**route-with-agents.ts**
- Full validation and error handling
- Type-safe agent selection
- Includes auto-routing patterns

## Which Files Are Actually Used?

### Active Files

1. **app/assistant.tsx** ← Used by app/page.tsx
2. **app/api/chat/route.ts** ← Active API route (Next.js convention)

### Purpose of Examples

These files serve as:
- Reference for different implementation patterns
- Documentation of alternative approaches
- Learning resources for team members
- Templates for future enhancements

## How to Use These Examples

Copy patterns from here to experiment with different approaches:

```bash
# Try simplified version
cp app/.examples/assistant-simple.tsx app/assistant.tsx

# Try complex version
cp app/.examples/assistant-with-agent-selector.tsx app/assistant.tsx

# Try simple API
cp app/.examples/route-simple.ts app/api/chat/route.ts
```

## Comparison

| File | Lines | Complexity | Features |
|------|-------|------------|----------|
| assistant-simple.tsx | ~90 | Low | All features |
| assistant-with-agent-selector.tsx | ~140 | Medium | 3 variants |
| **assistant.tsx (active)** | ~77 | Low | All features + dynamic body fix |

| File | Lines | Validation | Error Handling |
|------|-------|------------|----------------|
| route-simple.ts | 15 | Framework | Framework |
| route-with-agents.ts | 80 | Manual | Comprehensive |
| **route.ts (active)** | 36 | Framework | Basic |

## Recommendation

The active files (`assistant.tsx` and `route.ts`) are the best versions - they combine:
- ✅ Simplicity from route-simple.ts
- ✅ Features from route-with-agents.ts
- ✅ Dynamic body fix for agent switching
- ✅ Clean code with good documentation

Keep these examples for reference, but use the active files in production.
