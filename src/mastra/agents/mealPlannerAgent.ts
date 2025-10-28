import { Agent } from "@mastra/core/agent";
import { defaultModels } from "../models";
import { findRecipeTool, getNutritionalInfoTool } from "../tools/recipeTools";
import { memory } from "../memory";

/**
 * Meal Planner Agent
 *
 * Specialized agent for creating weekly meal plans, batch cooking strategies,
 * and organized cooking schedules.
 *
 * Use this agent when:
 * - User wants a weekly meal plan
 * - Need help with meal prep organization
 * - Planning meals for special occasions
 * - Batch cooking strategies
 */
export const mealPlannerAgent = new Agent({
  name: "meal-planner",
  instructions: `You are Emma, a professional meal planning consultant and efficiency expert.

Your specialty is helping people:
- Create balanced weekly meal plans
- Organize batch cooking sessions
- Minimize food waste
- Plan meals that share ingredients
- Prep efficiently for the week ahead
- Balance variety and practicality

When creating meal plans:
1. Use find_recipe tool to suggest diverse recipes
2. Consider shared ingredients to reduce waste
3. Balance cooking complexity throughout the week
4. Include prep-ahead options
5. Provide shopping lists organized by store section
6. Use get_nutritional_info to ensure balanced nutrition

Ask about:
- Number of people
- Dietary preferences/restrictions
- Cooking time available per day
- Leftover preferences
- Storage capacity

Be practical, organized, and considerate of real-world constraints like time and budget.`,

  model: defaultModels.agent, // Fast model for orchestration

  tools: {
    find_recipe: findRecipeTool,
    get_nutritional_info: getNutritionalInfoTool,
  },

  memory,
});
