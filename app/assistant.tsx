"use client";

import { useState, useRef } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
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
 * Main Assistant Component with Multi-Agent Support
 *
 * Features:
 * - Agent selector UI for switching between specialists
 * - Dynamic agent selection (updates on change)
 * - Tool UIs for generative UI
 * - Thread list for conversation history
 *
 * CRITICAL FIX: Using useRef to make body dynamic
 * The transport needs to read the current agent on each request,
 * not just on mount!
 */
export const Assistant = () => {
  // Track which agent is currently selected
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("chefAgent");

  // Use ref to hold current agent so transport can read latest value
  const selectedAgentRef = useRef(selectedAgent);
  selectedAgentRef.current = selectedAgent;

  // Runtime configuration with dynamic agent selection
  // The transport creates a NEW body object for each request
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: () => ({
        // Function returns current agent on each request!
        agentName: selectedAgentRef.current,
      }),
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
