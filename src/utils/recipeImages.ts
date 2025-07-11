// Import all recipe images
import oatmealBerries from "@/assets/recipe-oatmeal-berries.jpg";
import greenSmoothie from "@/assets/recipe-green-smoothie.jpg";
import chickenSalad from "@/assets/recipe-chicken-salad.jpg";

// Recipe image mappings
export const recipeImages = {
  'pre_breakfast_1': oatmealBerries,
  'pre_breakfast_2': greenSmoothie,
  'pre_lunch_1': chickenSalad,
  // Add more mappings as needed
};

export const getRecipeImage = (recipeId: string): string | undefined => {
  return recipeImages[recipeId as keyof typeof recipeImages];
};