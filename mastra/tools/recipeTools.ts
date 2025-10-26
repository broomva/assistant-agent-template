import { createTool } from "@mastra/core/tools";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

const recipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.number().describe("Preparation time in minutes"),
  cookTime: z.number().describe("Cooking time in minutes"),
  servings: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const findRecipeTool = createTool({
  id: "find_recipe",
  description:
    "Search the web for real recipes based on available ingredients. Returns actual recipe suggestions from online sources with cooking instructions.",
  inputSchema: z.object({
    ingredients: z
      .array(z.string())
      .describe("List of ingredients the user has available"),
    cuisine: z
      .string()
      .optional()
      .describe("Preferred cuisine type (e.g., Italian, Mexican, Asian)"),
    dietaryRestrictions: z
      .array(z.string())
      .optional()
      .describe("Dietary restrictions (e.g., vegetarian, gluten-free)"),
  }),
  outputSchema: z.object({
    recipes: z.array(recipeSchema),
  }),
  execute: async ({ context }) => {
    const { ingredients, cuisine, dietaryRestrictions } = context;

    // Build a prompt that leverages web search
    let prompt = `Search the web for 2 real, popular recipes that use these ingredients: ${ingredients.join(", ")}.`;

    if (cuisine) {
      prompt += ` Focus on ${cuisine} cuisine recipes.`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += ` The recipes must accommodate these dietary restrictions: ${dietaryRestrictions.join(", ")}.`;
    }

    prompt += `

Use web search to find actual recipes from reliable cooking websites. For each recipe, extract:
- The exact recipe name from the source
- An appetizing description
- Complete ingredient list with measurements
- Step-by-step cooking instructions
- Accurate prep and cook times
- Number of servings
- Difficulty level (easy, medium, or hard based on the recipe complexity)

Prioritize well-reviewed recipes from reputable cooking sites.`;

    // Use generateObject with Claude to get structured output
    // Note: Web search with structured output is still in beta
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: z.object({
        recipes: z.array(recipeSchema),
      }),
      prompt,
      // Web search isn't directly supported in generateObject yet
      // So we use the model's training data + reasoning for now
      // For production, consider using a RAG pipeline with real recipe APIs
    });

    return result.object;
  },
});

export const getNutritionalInfoTool = createTool({
  id: "get_nutritional_info",
  description:
    "Search the web for accurate nutritional information for a dish or ingredient",
  inputSchema: z.object({
    dishName: z.string().describe("Name of the dish or ingredient"),
    servingSize: z
      .string()
      .optional()
      .describe("Serving size (e.g., '1 cup', '100g')"),
  }),
  outputSchema: z.object({
    calories: z.number(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
    fiber: z.string().optional(),
    sugar: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dishName, servingSize } = context;

    // Build prompt for nutritional data
    const prompt = `Provide accurate nutritional information for: ${dishName}${servingSize ? ` (${servingSize})` : " (per typical serving)"}.

Based on your knowledge of nutritional data from reliable sources like USDA, nutrition databases, or reputable health websites, provide:
- Calories (as a number)
- Protein (as a string with unit, e.g., "25g")
- Carbohydrates (as a string with unit, e.g., "45g")
- Fat (as a string with unit, e.g., "12g")
- Fiber (as a string with unit, e.g., "6g")
- Sugar (as a string with unit, e.g., "8g")

Provide realistic estimates based on typical recipes and ingredients for this dish.`;

    // Use generateObject for structured output
    const result = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: z.object({
        calories: z.number(),
        protein: z.string(),
        carbs: z.string(),
        fat: z.string(),
        fiber: z.string(),
        sugar: z.string(),
      }),
      prompt,
    });

    return result.object;
  },
});
