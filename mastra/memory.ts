import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

/**
 * Enhanced Memory Configuration with Working Memory
 *
 * Based on Mastra official patterns (memory-per-resource-example).
 *
 * Key Features:
 * - Persistent storage with LibSQL (local or Turso cloud)
 * - Working memory enabled for user profiles
 * - Resource-scoped (persists across ALL threads for same user!)
 * - Structured template for consistent profile tracking
 *
 * Usage in API:
 * ```typescript
 * await agent.stream(messages, {
 *   memory: {
 *     thread: threadId,        // Current conversation
 *     resource: userId         // User identity (persists across threads!)
 *   }
 * });
 * ```
 */
export const memory = new Memory({
  // Storage configuration
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),

  // Memory options
  options: {
    // Number of recent messages to include as context
    // Default is 5, we use 10 for more context
    lastMessages: 10,

    // Working Memory: Persistent user profiles
    // This is the KEY feature from official Mastra patterns
    workingMemory: {
      enabled: true,

      // 'resource' scope means memory persists across ALL threads
      // for the same user - NOT just one conversation!
      scope: 'resource',

      // Template guides the AI on what to track
      // The AI will fill this in as it learns about the user
      template: `# Chef Assistant User Profile

## Personal Information
- **Name**:
- **Location/Timezone**:
- **Language Preference**:

## Dietary Information
- **Dietary Restrictions**: (vegetarian, vegan, gluten-free, etc.)
- **Food Allergies**:
- **Dislikes**:
- **Favorite Cuisines**:

## Cooking Context
- **Skill Level**: (beginner, intermediate, advanced)
- **Available Cooking Time**: (quick meals, willing to spend time)
- **Kitchen Equipment**: (basic, well-equipped, specific tools)
- **Household Size**: (cooking for how many people)

## Goals & Preferences
- **Health Goals**: (weight loss, muscle gain, general health)
- **Nutrition Focus**: (high protein, low carb, balanced)
- **Meal Types**: (quick weeknight dinners, meal prep, entertaining)

## Conversation History
- **Frequently Requested Recipes**:
- **Ingredients Often Available**:
- **Past Questions & Topics**:
- **Favorite Agents**: (which specialists they prefer)

## Important Notes
- **Special Occasions**:
- **Cultural/Religious Considerations**:
- **Other Context**:
`,
    },
  },
});

/**
 * How Working Memory Works:
 *
 * 1. First Interaction:
 *    User: "I'm vegetarian"
 *    Agent: Learns this and updates working memory
 *    Working Memory: "Dietary Restrictions: vegetarian"
 *
 * 2. Days Later, New Thread:
 *    User: "What can I cook tonight?"
 *    Agent: Sees working memory → knows they're vegetarian
 *    Agent: "Here are some vegetarian options..."
 *
 * 3. Over Time:
 *    Agent builds comprehensive profile
 *    Recommendations become more personalized
 *    User doesn't need to repeat information
 *
 * This creates a MUCH better user experience!
 */

/**
 * Alternative: Simple Memory (No Working Memory)
 *
 * If you want to start simple, use this instead:
 */
export const memorySimple = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
  // No options - uses defaults (last 5 messages, no working memory)
});

/**
 * Alternative: Custom Working Memory Template
 *
 * You can customize the template for your specific use case:
 */
export const memoryCustom = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
  options: {
    lastMessages: 15, // More context
    workingMemory: {
      enabled: true,
      scope: 'resource',
      template: `# User Context
- Name:
- Preferences:
- Important Notes:
`, // Minimal template
    },
  },
});
