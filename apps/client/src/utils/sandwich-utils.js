import { PRODUCTS } from '../constants/ingredients-constants';

export const hydrateSandwichIngredientsData = (sandwich, ingredientsRawList) => {
  const newSandwich = { ...sandwich };

  newSandwich.ingredients = newSandwich.ingredients.reduce((acc, ingredient) => {
    const matchingIngredient = ingredientsRawList.find((item) => item.id === ingredient.ingredientId);

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

  const hasMeat = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCTS.meat));
  const hasDiary = sandwich.ingredients.some((ingredient) => ingredient.dietaryPreferences.includes(PRODUCTS.diary));

  if (
    (hasMeat && newIngredient.dietaryPreferences.includes(PRODUCTS.diary)) ||
    (hasDiary && newIngredient.dietaryPreferences.includes(PRODUCTS.meat))
  ) {
    return false;
  }

  return true;
};
