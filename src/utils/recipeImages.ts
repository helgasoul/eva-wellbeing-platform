// Recipe image mappings using public folder paths
export const recipeImages = {
  // Premenopause recipes
  'pre_breakfast_1': '/recipe-oatmeal-berries-nuts.jpg',
  'pre_breakfast_2': '/recipe-green-smoothie-fruits.jpg',
  'pre_lunch_1': '/recipe-chicken-avocado-salad.jpg',
  'pre_dinner_1': '/recipe-baked-fish-vegetables.jpg',
  
  // Perimenopause recipes
  'peri_breakfast_1': '/recipe-omelet-avocado-spinach.jpg',
  'peri_breakfast_2': '/recipe-quinoa-nuts-porridge.jpg',
  'peri_lunch_1': '/recipe-warm-tuna-salad.jpg',
  'peri_dinner_1': '/recipe-stewed-vegetables-tofu.jpg',
  
  // Menopause recipes
  'meno_breakfast_1': '/recipe-chia-pudding-berries.jpg',
  'meno_lunch_1': '/recipe-salmon-quinoa-salad-v2.jpg',
  'meno_lunch_2': '/recipe-lentil-soup-turmeric.jpg',
  'meno_dinner_1': '/recipe-baked-mackerel-vegetables.jpg',
  
  // Postmenopause recipes
  'post_breakfast_1': '/recipe-cottage-cheese-seeds-nuts.jpg',
  'post_lunch_1': '/recipe-sardines-greens-salad.jpg',
  'post_dinner_1': '/recipe-cottage-cheese-casserole.jpg',
  'post_snack_1': '/recipe-calcium-magnesium-smoothie.jpg',
};

export const getRecipeImage = (recipeId: string): string | undefined => {
  return recipeImages[recipeId as keyof typeof recipeImages];
};