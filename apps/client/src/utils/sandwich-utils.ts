import { MAX_NAME_LENGTH, PRODUCT } from '@sandwicheck/shared';
import type { HydratedSandwich, Ingredient, Sandwich, SandwichLayer } from '@/types/domain';

interface SandwichLike {
  ingredients: SandwichLayer[];
}

const DEFAULT_SANDWICH_NAME_SUFFIX = "'s Sandwich";

/**
 * Build the default sandwich name. With a firstName it clamps the owner part (never the suffix) so
 * the whole string fits MAX_NAME_LENGTH; with an empty/absent firstName it returns "My Sandwich"
 * (previously it rendered "undefined's Sandwich", and could overflow the length limit).
 */
export const buildDefaultSandwichName = (firstName: string | undefined): string => {
  if (!firstName) {
    return 'My Sandwich';
  }
  const owner = firstName.slice(0, MAX_NAME_LENGTH - DEFAULT_SANDWICH_NAME_SUFFIX.length);
  return `${owner}${DEFAULT_SANDWICH_NAME_SUFFIX}`;
};

export const hydrateSandwichIngredientsData = (
  sandwich: Sandwich,
  ingredientsRawList: Ingredient[],
): HydratedSandwich => {
  const ingredients = sandwich.ingredients.reduce<SandwichLayer[]>((acc, ingredient) => {
    // If the layer already carries full catalog data (e.g. a builder draft), use it as-is.
    if ('type' in ingredient && 'name' in ingredient && ingredient.id && ingredient.type && ingredient.name) {
      acc.push(ingredient as SandwichLayer);
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

  // Guard the optional chaining: a cached/legacy layer may lack dietaryPreferences and would throw.
  const hasMeat = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences?.includes(PRODUCT.meat));
  const hasDairy = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences?.includes(PRODUCT.dairy));

  if (
    (hasMeat && newIngredient.dietaryPreferences.includes(PRODUCT.dairy)) ||
    (hasDairy && newIngredient.dietaryPreferences.includes(PRODUCT.meat))
  ) {
    return false;
  }

  return true;
};
