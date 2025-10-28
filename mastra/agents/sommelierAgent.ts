import { Agent } from "@mastra/core/agent";
import { defaultModels } from "../models";
import { memory } from "../memory";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateObject } from "ai";

/**
 * Wine Pairing Tool
 * Suggests wine pairings for dishes
 */
const winePairingTool = createTool({
  id: "suggest_wine_pairing",
  description:
    "Suggest wine pairings for a specific dish based on flavor profiles, cuisine type, and cooking method",
  inputSchema: z.object({
    dishName: z.string().describe("Name of the dish"),
    mainIngredients: z
      .array(z.string())
      .optional()
      .describe("Main ingredients in the dish"),
    cuisineType: z
      .string()
      .optional()
      .describe("Type of cuisine (Italian, French, etc.)"),
    preparationMethod: z
      .string()
      .optional()
      .describe("Cooking method (grilled, roasted, fried, etc.)"),
  }),
  outputSchema: z.object({
    recommendations: z.array(
      z.object({
        wineName: z.string().describe("Name of the wine"),
        wineType: z
          .string()
          .describe("Type of wine (Red, White, Rosé, Sparkling)"),
        characteristics: z.string().describe("Wine characteristics"),
        pairingReason: z
          .string()
          .describe("Why this wine pairs well with the dish"),
        priceRange: z
          .enum(["budget", "mid-range", "premium"])
          .describe("Price category"),
        alternatives: z
          .array(z.string())
          .optional()
          .describe("Alternative wine suggestions"),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { dishName, mainIngredients, cuisineType, preparationMethod } =
      context;

    let prompt = `Suggest 2-3 wine pairings for: ${dishName}`;

    if (mainIngredients && mainIngredients.length > 0) {
      prompt += `\nMain ingredients: ${mainIngredients.join(", ")}`;
    }

    if (cuisineType) {
      prompt += `\nCuisine type: ${cuisineType}`;
    }

    if (preparationMethod) {
      prompt += `\nPreparation: ${preparationMethod}`;
    }

    prompt += `

For each wine pairing, provide:
- Specific wine name and type (varietals, regions)
- Key characteristics (body, acidity, tannins, flavor notes)
- Detailed explanation of why it pairs well
- Price range category
- 2-3 alternative options

Consider:
- Flavor complementarity and contrast
- Weight matching (light dish = light wine)
- Acidity to cut through richness
- Regional traditional pairings
- Modern pairing techniques`;

    const result = await generateObject({
      model: defaultModels.tools, // High quality for accurate pairings
      schema: z.object({
        recommendations: z.array(
          z.object({
            wineName: z.string(),
            wineType: z.string(),
            characteristics: z.string(),
            pairingReason: z.string(),
            priceRange: z.enum(["budget", "mid-range", "premium"]),
            alternatives: z.array(z.string()).optional(),
          })
        ),
      }),
      prompt,
    });

    return result.object;
  },
});

/**
 * Sommelier Agent
 *
 * Specialized agent for wine and beverage pairings with food.
 *
 * Use this agent when:
 * - User asks about wine pairings
 * - Planning a dinner party
 * - Need beverage recommendations
 * - Learning about wine
 */
export const sommelierAgent = new Agent({
  name: "sommelier",
  instructions: `You are Jean-Pierre, a master sommelier with 20 years of experience in fine dining.

Your expertise includes:
- Wine and food pairing principles
- Wine regions and varietals
- Flavor profiles and characteristics
- Budget-conscious recommendations
- Non-alcoholic pairing alternatives

When suggesting pairings:
1. Use suggest_wine_pairing tool for detailed recommendations
2. Explain pairing principles in accessible language
3. Offer options at different price points
4. Suggest alternatives for non-wine drinkers
5. Consider the full meal context, not just one dish

Your style:
- Knowledgeable but approachable
- Never snobbish or intimidating
- Educational and enthusiastic
- Respectful of budget constraints
- Inclusive of all preferences

Ask clarifying questions about:
- The full menu or meal context
- Occasion (casual vs formal)
- Guest preferences
- Budget considerations`,

  model: defaultModels.agent, // Fast for conversation

  tools: {
    suggest_wine_pairing: winePairingTool,
  },

  memory,
});
