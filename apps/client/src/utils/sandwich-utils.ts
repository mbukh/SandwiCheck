import { PRODUCT } from '@sandwicheck/shared';
import type { Ingredient, Sandwich, SandwichLayer } from '@/types/domain';

interface SandwichLike {
  ingredients: SandwichLayer[];
}

export const hydrateSandwichIngredientsData = (sandwich: Sandwich, ingredientsRawList: Ingredient[]): Sandwich => {
  const ingredients = sandwich.ingredients.reduce<SandwichLayer[]>((acc, ingredient) => {
    // If ingredient already has full data (from builder), use it as-is
    if (ingredient.id && ingredient.type && ingredient.name) {
      acc.push(ingredient);
      return acc;
    }

    // Otherwise, look up by ingredientId (server format) or id (fallback)
    const matchingIngredient = ingredientsRawList.find(
      (item) => item.id === ingredient.ingredientId || item.id === ingredient.id,
    );

    if (matchingIngredient) {
      acc.push({
        ...ingredient,
        ...matchingIngredient,
      });
    }

    return acc;
  }, []);

  return { ...sandwich, ingredients };
};

export const isTypeInSandwich = (ingredientType: string, sandwich: SandwichLike): boolean => {
  return sandwich.ingredients.some((ingredient) => ingredient.type === ingredientType);
};

export const doesStayKosherWithIngredient = (newIngredient: Ingredient, sandwich: SandwichLike): boolean => {
  if (sandwich.ingredients.length < 2 || !newIngredient.dietaryPreferences) {
    return true;
  }

  const hasMeat = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCT.meat));
  const hasDairy = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCT.dairy));

  if (
    (hasMeat && newIngredient.dietaryPreferences.includes(PRODUCT.dairy)) ||
    (hasDairy && newIngredient.dietaryPreferences.includes(PRODUCT.meat))
  ) {
    return false;
  }

  return true;
};
