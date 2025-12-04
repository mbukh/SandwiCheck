import { PRODUCT } from '../constants/ingredients-constants';

export const hydrateSandwichIngredientsData = (sandwich, ingredientsRawList) => {
  const newSandwich = { ...sandwich };

  newSandwich.ingredients = newSandwich.ingredients.reduce((acc, ingredient) => {
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

  return newSandwich;
};

export const getTopIngredientOfCurrentType = (sandwich, ingredientsOfType, currentType) => {
  return ingredientsOfType.find((ingredient) => {
    const latest = sandwich.ingredients.findLast((ingredient) => ingredient.type === currentType);

    if (!latest) {
      return false;
    }
    return ingredient.id === latest.id;
  });
};

export const getIngredientPlaceInSandwich = (ingredient, sandwich) => {
  const ingredientIndex = sandwich.ingredients.findIndex(
    (sandwichIngredient) => sandwichIngredient.id === ingredient.id,
  );

  const isPresent = ingredientIndex !== -1;
  const isBottom = isPresent && ingredientIndex <= 1;
  const isTop = isPresent && ingredientIndex === sandwich.ingredients.length - 1;

  return {
    isPresent,
    isBottom,
    isTop,
  };
};

export const isTypeInSandwich = (ingredientType, sandwich) => {
  return sandwich.ingredients.some((ingredient) => ingredient.type === ingredientType);
};

export const doesStayKosherWithIngredient = (newIngredient, sandwich) => {
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
