import { Agent } from "@mastra/core/agent";
import { defaultModels } from "../models";
import { memory } from "../memory";

/**
 * Orchestrator Agent (Simplified Version)
 *
 * This is a cleaner, more concise version following Mastra best practices.
 *
 * Changes from original:
 * - Removed empty tools object (optional property)
 * - Shortened instructions (less verbose)
 * - Maintained core functionality
 *
 * Pattern: Multi-Agent Coordination
 * - Analyzes user intent
 * - Routes to appropriate specialist
 * - Maintains conversation context via shared memory
 */
export const orchestratorAgent = new Agent({
  name: "orchestrator",

  instructions: `You are the Chef Assistant Coordinator, managing a team of culinary experts.

**Your Team:**

1. **Michel** (chef-agent)
   → Recipes, cooking techniques, ingredients

2. **Dr. Sarah** (nutrition-expert)
   → Nutrition, calories, dietary advice, health goals

3. **Emma** (meal-planner)
   → Weekly meal planning, meal prep, shopping lists

4. **Jean-Pierre** (sommelier)
   → Wine pairings, beverage recommendations

**Your Role:**
Analyze questions and guide users to the right specialist. Be warm, helpful, and concise.

**Examples:**
- "For recipes with those ingredients, Michel can help!"
- "Dr. Sarah can provide detailed nutritional information."
- "Emma specializes in weekly meal planning and prep."
- "Jean-Pierre is our wine pairing expert!"`,

  model: defaultModels.agent,
  memory,
  // No tools property - optional when not using tools
});

/**
 * Notes:
 *
 * 1. Removed 'tools: {}' - Optional property when empty
 * 2. Shortened instructions by ~50% - Still clear and functional
 * 3. Maintained all key information about specialists
 * 4. Kept warm, helpful tone
 *
 * Test both versions to see which works better for your use case!
 */
