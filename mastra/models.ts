/**
 * Model Configuration
 *
 * This file demonstrates best practices for organizing and selecting models
 * for different tasks. Each model has different strengths and cost profiles.
 */

import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

/**
 * Model Selection Strategy:
 *
 * 1. FAST & CHEAP (Agent conversation, simple tasks)
 *    - GPT-4o-mini, Claude Haiku
 *    - Cost: ~$0.15-0.60 per 1M tokens
 *
 * 2. BALANCED (Tool execution, structured output)
 *    - GPT-4o, Claude Sonnet
 *    - Cost: ~$3-15 per 1M tokens
 *
 * 3. PREMIUM (Complex reasoning, analysis)
 *    - o1-preview, Claude Opus
 *    - Cost: ~$15-75 per 1M tokens
 */

// ============================================================================
// FAST & COST-EFFECTIVE MODELS
// ============================================================================

/**
 * GPT-4o-mini: Best for general conversation and routing
 * - Excellent for agent orchestration
 * - Fast response times
 * - Very cost-effective
 */
export const fastOpenAI = openai("gpt-4o-mini");

/**
 * Claude Haiku: Fast, efficient, good instruction following
 * - Great for simple structured tasks
 * - Lower latency than Sonnet
 */
export const fastAnthropic = anthropic("claude-haiku-4-5-20251001");

// ============================================================================
// BALANCED MODELS (Production Workhorses)
// ============================================================================

/**
 * GPT-4o: Balanced performance and cost
 * - Great for complex conversations
 * - Good structured output
 * - Reliable tool calling
 */
export const balancedOpenAI = openai("gpt-4o");

/**
 * Claude 3.5 Sonnet: High quality, best for structured output
 * - Excellent for tool execution
 * - Superior reasoning
 * - Great with web search
 * - Better at following complex instructions
 */
export const balancedAnthropic = anthropic("claude-sonnet-4-5-20250929");

// ============================================================================
// PREMIUM MODELS (Complex Tasks)
// ============================================================================

/**
 * o1-preview: Advanced reasoning, problem-solving
 * - Best for complex logical tasks
 * - Multi-step reasoning
 * - More expensive, slower
 */
export const premiumOpenAI = openai("o1-preview");

/**
 * Claude Opus: Highest quality, best reasoning
 * - Best for complex analysis
 * - Excellent creative tasks
 * - Most expensive
 */
export const premiumAnthropic = anthropic("claude-opus-4-5-20250929");

// ============================================================================
// SPECIALIZED MODELS
// ============================================================================

/**
 * o1-mini: Fast reasoning model
 * - Good for coding, math, logic
 * - Cheaper than o1-preview
 */
export const reasoningOpenAI = openai("o1-mini");

// ============================================================================
// MODEL SELECTION HELPERS
// ============================================================================

/**
 * Use Case to Model Mapping
 */
export const modelsByUseCase = {
  // General conversation
  conversation: {
    fast: fastOpenAI,
    balanced: balancedOpenAI,
    premium: premiumOpenAI,
  },

  // Tool execution
  tools: {
    fast: fastAnthropic,
    balanced: balancedAnthropic, // Recommended for tools
    premium: premiumAnthropic,
  },

  // Structured output
  structured: {
    fast: fastOpenAI, // Has native structured mode
    balanced: balancedAnthropic, // Best quality
    premium: premiumAnthropic,
  },

  // Reasoning & analysis
  reasoning: {
    fast: reasoningOpenAI,
    balanced: premiumOpenAI,
    premium: premiumAnthropic,
  },
} as const;

/**
 * Get model based on task complexity and budget
 */
export function selectModel(
  useCase: keyof typeof modelsByUseCase,
  tier: "fast" | "balanced" | "premium" = "balanced"
): LanguageModel {
  return modelsByUseCase[useCase][tier];
}

/**
 * Cost-optimized defaults
 * These provide the best balance of quality and cost for most use cases
 */
export const defaultModels = {
  agent: fastOpenAI, // Agent orchestration: fast & cheap
  tools: balancedAnthropic, // Tool execution: quality matters
  structured: balancedAnthropic, // Structured output: accuracy critical
  analysis: premiumAnthropic, // Deep analysis: quality first
} as const;

// ============================================================================
// EXAMPLES OF USE
// ============================================================================

/**
 * Example 1: Agent with cost optimization
 *
 * new Agent({
 *   name: "my-agent",
 *   model: defaultModels.agent, // Fast for routing
 *   tools: { ... }
 * })
 */

/**
 * Example 2: Tool with quality focus
 *
 * createTool({
 *   execute: async () => {
 *     const result = await generateObject({
 *       model: defaultModels.tools, // High quality for tools
 *       schema: mySchema,
 *       prompt: "..."
 *     });
 *   }
 * })
 */

/**
 * Example 3: Dynamic model selection
 *
 * const model = selectModel("reasoning",
 *   isComplexTask ? "premium" : "balanced"
 * );
 */
