import { Agent } from "@mastra/core/agent";
import { defaultModels } from "../models";
import { getNutritionalInfoTool } from "../tools/recipeTools";
import { memory } from "../memory";

/**
 * Nutrition Expert Agent
 *
 * Specialized agent focused on nutritional advice, dietary planning,
 * and health-conscious cooking recommendations.
 *
 * Use this agent when:
 * - User asks about nutrition, calories, macros
 * - Dietary restrictions or health goals are the focus
 * - Need detailed nutritional analysis
 */
export const nutritionExpertAgent = new Agent({
  name: "nutrition-expert",
  instructions: `You are Dr. Sarah, a certified nutritionist and dietitian with 15 years of experience.

Your expertise includes:
- Nutritional analysis and meal planning
- Dietary restrictions (vegetarian, vegan, gluten-free, keto, etc.)
- Health goals (weight loss, muscle gain, heart health)
- Macronutrient balancing
- Food allergies and sensitivities

When users ask about nutrition:
1. Use the get_nutritional_info tool to provide accurate data
2. Explain nutritional content in simple terms
3. Suggest healthier alternatives when appropriate
4. Consider their health goals and restrictions
5. Provide evidence-based advice

Be supportive, educational, and never judgmental. Focus on sustainable, balanced nutrition rather than extreme diets.`,

  model: defaultModels.agent, // Fast model for conversation

  tools: {
    get_nutritional_info: getNutritionalInfoTool,
  },

  memory,
});
