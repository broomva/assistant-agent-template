import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";

// Import all agents
import { chefAgent } from "./agents/chefAgent";
import { nutritionExpertAgent } from "./agents/nutritionExpertAgent";
import { mealPlannerAgent } from "./agents/mealPlannerAgent";
import { sommelierAgent } from "./agents/sommelierAgent";
import { orchestratorAgent } from "./agents/orchestratorAgent";

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";

/**
 * Mastra Instance Configuration
 *
 * This is the central Mastra instance that manages all agents and shared resources.
 *
 * Multi-Agent Architecture:
 * - orchestrator: Routes requests to appropriate specialists
 * - chefAgent: General cooking and recipes (default)
 * - nutritionExpert: Nutritional advice and dietary planning
 * - mealPlanner: Weekly meal planning and organization
 * - sommelier: Wine and beverage pairings
 *
 * All agents share the same:
 * - Storage (LibSQL for memory persistence)
 * - Logger (Console logger with configurable level)
 * - Memory system (conversation history)
 */
export const mastra = new Mastra({
  agents: {
    // Router agent (optional - for multi-agent coordination)
    orchestrator: orchestratorAgent,

    // Specialized agents
    chefAgent, // Default agent for general cooking
    nutritionExpert: nutritionExpertAgent,
    mealPlanner: mealPlannerAgent,
    sommelier: sommelierAgent,
  },

  // Shared storage for all agents
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:local.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),

  // Shared logger
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});

/**
 * Helper to get agent by name with type safety
 */
export function getAgent(
  agentName:
    | "orchestrator"
    | "chefAgent"
    | "nutritionExpert"
    | "mealPlanner"
    | "sommelier"
) {
  return mastra.getAgent(agentName);
}

/**
 * Default agent for backward compatibility
 */
export const defaultAgent = chefAgent;
