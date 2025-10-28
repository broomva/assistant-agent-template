"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { RecipeToolUI } from "@/components/assistant-ui/tool-ui/recipe-tool-ui";
import { NutritionToolUI } from "@/components/assistant-ui/tool-ui/nutrition-tool-ui";
import {
  AgentSelector,
  type AgentName,
} from "@/components/assistant-ui/agent-selector";

/**
 * Assistant with Multi-Agent Support
 *
 * This version allows users to select which expert they want to consult.
 * The selected agent is passed to the API route via the transport body.
 *
 * Key Features:
 * - Agent selector UI
 * - Dynamic agent switching
 * - Maintains conversation context
 * - Agent selection persists in session
 */
export const Assistant = () => {
  // Track which agent is currently selected
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("chefAgent");

  // Create runtime with agent selection in body
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: {
        agentName: selectedAgent, // Pass agent to API
      },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {/* Register Tool UIs */}
      <RecipeToolUI />
      <NutritionToolUI />

      {/* Main Layout */}
      <div className="flex h-dvh flex-col gap-2 px-4 py-4">
        {/* Header with Agent Selector */}
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-xl font-bold text-gray-900">Chef Assistant</h1>
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentChange={setSelectedAgent}
          />
        </div>

        {/* Chat Interface */}
        <div className="grid flex-1 grid-cols-[200px_1fr] gap-x-2 overflow-hidden">
          <ThreadList />
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};

/**
 * Alternative: Agent Selector in Sidebar
 *
 * This places the agent selector alongside the thread list
 */
export const AssistantWithSidebarSelector = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("chefAgent");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: { agentName: selectedAgent },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RecipeToolUI />
      <NutritionToolUI />

      <div className="grid h-dvh grid-cols-[240px_1fr] gap-x-2 px-4 py-4">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-3">
          <div className="border-b pb-3">
            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
              Select Expert
            </p>
            <AgentSelector
              selectedAgent={selectedAgent}
              onAgentChange={setSelectedAgent}
            />
          </div>
          <ThreadList />
        </div>

        {/* Main Chat */}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};

/**
 * Alternative: Keep It Simple (No UI Selector)
 *
 * Uses automatic agent routing or defaults to chefAgent.
 * Good for starting simple and adding complexity later.
 */
export const AssistantSimple = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      // No agentName - API will use default or auto-route
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RecipeToolUI />
      <NutritionToolUI />
      <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
