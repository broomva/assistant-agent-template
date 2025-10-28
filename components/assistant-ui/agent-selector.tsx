"use client";

import { useState } from "react";
import { ChefHat, Apple, CalendarDays, Wine, Settings } from "lucide-react";

export type AgentName =
  | "chefAgent"
  | "nutritionExpert"
  | "mealPlanner"
  | "sommelier";

interface Agent {
  id: AgentName;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const agents: Agent[] = [
  {
    id: "chefAgent",
    name: "Chef Michel",
    description: "General cooking & recipes",
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "nutritionExpert",
    name: "Dr. Sarah",
    description: "Nutrition & dietary advice",
    icon: <Apple className="h-4 w-4" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "mealPlanner",
    name: "Emma",
    description: "Meal planning & prep",
    icon: <CalendarDays className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "sommelier",
    name: "Jean-Pierre",
    description: "Wine & beverage pairings",
    icon: <Wine className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

interface AgentSelectorProps {
  selectedAgent: AgentName;
  onAgentChange: (agent: AgentName) => void;
}

export function AgentSelector({
  selectedAgent,
  onAgentChange,
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];

  return (
    <div className="relative">
      {/* Current Agent Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${currentAgent.color}`}
        aria-label="Select agent"
      >
        {currentAgent.icon}
        <span>{currentAgent.name}</span>
        <Settings className="h-3 w-3 opacity-50" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select Your Expert
              </p>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    onAgentChange(agent.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50 ${
                    agent.id === selectedAgent ? "bg-gray-100" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-md border p-1.5 ${agent.color}`}
                  >
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {agent.name}
                    </p>
                    <p className="text-xs text-gray-500">{agent.description}</p>
                  </div>
                  {agent.id === selectedAgent && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact version for mobile/sidebar
 */
export function AgentSelectorCompact({
  selectedAgent,
  onAgentChange,
}: AgentSelectorProps) {
  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];

  return (
    <select
      value={selectedAgent}
      onChange={(e) => onAgentChange(e.target.value as AgentName)}
      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${currentAgent.color}`}
    >
      {agents.map((agent) => (
        <option key={agent.id} value={agent.id}>
          {agent.name} - {agent.description}
        </option>
      ))}
    </select>
  );
}
