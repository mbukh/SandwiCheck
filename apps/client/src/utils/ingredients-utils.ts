import { type IngredientType, SHAPE, TYPE } from '@sandwicheck/shared';
import { DEFAULT_PORTION, EXTENSION, INGREDIENTS_IMAGES_PATH } from '@/constants/ingredients-constants';
import type { Ingredient, SandwichLayer } from '@/types/domain';

interface GenerateIngredientImageSrcArgs {
  ingredient: SandwichLayer;
  sandwich: { ingredients: SandwichLayer[] };
  forceBreadSliced?: boolean;
}

export const generateIngredientImageSrc = ({
  ingredient,
  sandwich,
  forceBreadSliced = false,
}: GenerateIngredientImageSrcArgs): string => {
  const { imageBase, type, portion = DEFAULT_PORTION } = ingredient;

  const path = `${import.meta.env.VITE_API_SERVER}/${INGREDIENTS_IMAGES_PATH}`;

  const breadShape = sandwich.ingredients[0]?.shape || SHAPE.long;

  const breadImageIndex = sandwich.ingredients.length < 2 && !forceBreadSliced ? 0 : 1;

  const suffix: Partial<Record<IngredientType, string>> = {
    [TYPE.bread]: ['', '_sliced'][breadImageIndex],
    [TYPE.protein]: `_${breadShape}_${portion}`,
    [TYPE.cheese]: `_${breadShape}_${portion}`,
    [TYPE.toppings]: `_${breadShape}_${portion}`,
    [TYPE.condiments]: `_${breadShape}_${portion}`,
  };

  const extension = `.${EXTENSION}`;

  return path + imageBase + suffix[type] + extension;
};

export const groupIngredientsByTypes = (ingredients: Ingredient[]): Record<string, Ingredient[]> => {
  const groupedByTypes: Record<string, Ingredient[]> = {};

  // Create arrays for each type in TYPE order
  for (const type of Object.values(TYPE)) {
    groupedByTypes[type] = [];
  }

  // Add each ingredient to the corresponding type array
  for (const ingredient of ingredients) {
    if (Object.prototype.hasOwnProperty.call(groupedByTypes, ingredient.type)) {
      groupedByTypes[ingredient.type]?.push(ingredient);
    }
  }

  // Add any missing types to the end
  for (const ingredient of ingredients) {
    if (!Object.prototype.hasOwnProperty.call(groupedByTypes, ingredient.type)) {
      groupedByTypes[ingredient.type] = [ingredient];
    }
  }

  return groupedByTypes;
};
