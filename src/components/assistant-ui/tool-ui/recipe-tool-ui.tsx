"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { motion } from "framer-motion";
import { Clock, Users, ChefHat, Loader2 } from "lucide-react";

type RecipeArgs = {
  ingredients: string[];
  cuisine?: string;
  dietaryRestrictions?: string[];
};

type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
};

type RecipeResult = {
  recipes: Recipe[];
};

export const RecipeToolUI = makeAssistantToolUI<RecipeArgs, RecipeResult>({
  toolName: "find_recipe",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">
              Finding recipes with your ingredients...
            </p>
            {args?.ingredients && (
              <p className="text-sm text-blue-700">
                {args.ingredients.join(", ")}
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    if (!result || !result.recipes || result.recipes.length === 0) {
      return null;
    }

    const getDifficultyColor = (difficulty: Recipe["difficulty"]) => {
      switch (difficulty) {
        case "easy":
          return "bg-green-100 text-green-800 border-green-200";
        case "medium":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "hard":
          return "bg-red-100 text-red-800 border-red-200";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ChefHat className="h-4 w-4" />
          <span>
            Found {result.recipes.length} recipe
            {result.recipes.length !== 1 ? "s" : ""} for you
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {result.recipes.map((recipe, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {recipe.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {recipe.description}
                </p>
              </div>

              <div className="p-4 space-y-3">
                {/* Recipe metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {recipe.prepTime + recipe.cookTime} min total
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
                  >
                    {recipe.difficulty}
                  </span>
                </div>

                {/* Ingredients */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Ingredients:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1.5">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="text-xs text-gray-500 italic">
                          +{recipe.ingredients.length - 3} more ingredients
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Instructions preview */}
                {recipe.instructions && recipe.instructions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Instructions:
                    </h4>
                    <ol className="space-y-1.5 text-sm text-gray-600">
                      {recipe.instructions.slice(0, 2).map((instruction, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-medium text-orange-500 min-w-[1.5rem]">
                            {i + 1}.
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                      {recipe.instructions.length > 2 && (
                        <li className="text-xs text-gray-500 italic pl-6">
                          +{recipe.instructions.length - 2} more steps
                        </li>
                      )}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  },
});
