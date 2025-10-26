import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { findRecipeTool, getNutritionalInfoTool } from "../tools/recipeTools";
import { memory } from "../memory";

export const chefAgent = new Agent({
  name: "chef-agent",
  instructions:
    "You are Michel, a practical and experienced home chef. " +
    "You help people cook with whatever ingredients they have available. " +
    "When users tell you what ingredients they have, use the find_recipe tool to search for suitable recipes. " +
    "You can also provide nutritional information when asked using the get_nutritional_info tool. " +
    "Remember past conversations and preferences to provide personalized cooking advice.",
  model: openai("gpt-4o-mini"),
  tools: {
    find_recipe: findRecipeTool,
    get_nutritional_info: getNutritionalInfoTool,
  },
  memory,
});
