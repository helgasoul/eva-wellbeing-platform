// Import all recipe images
import oatmealBerries from "@/assets/recipe-oatmeal-berries.jpg";
import greenSmoothie from "@/assets/recipe-green-smoothie.jpg";
import chickenSalad from "@/assets/recipe-chicken-salad.jpg";
import omeletAvocadoSpinach from "@/assets/recipe-omelet-avocado-spinach.jpg";
import quinoaNuts from "@/assets/recipe-quinoa-nuts.jpg";
import warmChickpeaSalad from "@/assets/recipe-warm-chickpea-salad.jpg";
import tofuVegetables from "@/assets/recipe-tofu-vegetables.jpg";
import chiaPuddingBerries from "@/assets/recipe-chia-pudding-berries.jpg";
import salmonQuinoaSalad from "@/assets/recipe-salmon-quinoa-salad.jpg";
import lentilTurmericSoup from "@/assets/recipe-lentil-turmeric-soup.jpg";
import bakedMackerelVegetables from "@/assets/recipe-baked-mackerel-vegetables.jpg";
import cottageCheesNuts from "@/assets/recipe-cottage-cheese-nuts.jpg";
import sardinesGreensSalad from "@/assets/recipe-sardines-greens-salad.jpg";
import cottageCheeseCasserole from "@/assets/recipe-cottage-cheese-casserole.jpg";
import calciumMagnesiumSmoothie from "@/assets/recipe-calcium-magnesium-smoothie.jpg";
import bakedCodVegetables from "@/assets/recipe-baked-cod-vegetables.jpg";

// Recipe image mappings
export const recipeImages = {
  // Premenopause recipes
  'pre_breakfast_1': oatmealBerries,
  'pre_breakfast_2': greenSmoothie,
  'pre_lunch_1': chickenSalad,
  'pre_dinner_1': bakedCodVegetables,
  
  // Perimenopause recipes
  'peri_breakfast_1': omeletAvocadoSpinach,
  'peri_breakfast_2': quinoaNuts,
  'peri_lunch_1': warmChickpeaSalad,
  'peri_dinner_1': tofuVegetables,
  
  // Menopause recipes
  'meno_breakfast_1': chiaPuddingBerries,
  'meno_lunch_1': salmonQuinoaSalad,
  'meno_lunch_2': lentilTurmericSoup,
  'meno_dinner_1': bakedMackerelVegetables,
  
  // Postmenopause recipes
  'post_breakfast_1': cottageCheesNuts,
  'post_lunch_1': sardinesGreensSalad,
  'post_dinner_1': cottageCheeseCasserole,
  'post_snack_1': calciumMagnesiumSmoothie,
};

export const getRecipeImage = (recipeId: string): string | undefined => {
  return recipeImages[recipeId as keyof typeof recipeImages];
};