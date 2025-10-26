"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { motion } from "framer-motion";
import { Apple, Loader2 } from "lucide-react";

type NutritionArgs = {
  dishName: string;
  servingSize?: string;
};

type NutritionResult = {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sugar?: string;
};

export const NutritionToolUI = makeAssistantToolUI<
  NutritionArgs,
  NutritionResult
>({
  toolName: "get_nutritional_info",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
          <div>
            <p className="font-medium text-green-900">
              Looking up nutritional info...
            </p>
            {args?.dishName && (
              <p className="text-sm text-green-700">{args.dishName}</p>
            )}
          </div>
        </motion.div>
      );
    }

    if (!result) {
      return null;
    }

    const nutrients = [
      { label: "Calories", value: `${result.calories} kcal`, color: "orange" },
      { label: "Protein", value: result.protein, color: "blue" },
      { label: "Carbs", value: result.carbs, color: "purple" },
      { label: "Fat", value: result.fat, color: "yellow" },
      ...(result.fiber
        ? [{ label: "Fiber", value: result.fiber, color: "green" }]
        : []),
      ...(result.sugar
        ? [{ label: "Sugar", value: result.sugar, color: "red" }]
        : []),
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Nutritional Information
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {args.dishName}
            {args.servingSize && ` (${args.servingSize})`}
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {nutrients.map((nutrient, index) => (
              <motion.div
                key={nutrient.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {nutrient.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {nutrient.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  },
});
