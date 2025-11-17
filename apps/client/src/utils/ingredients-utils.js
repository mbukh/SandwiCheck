import { TYPE, EXTENSION, SHAPE, DEFAULT_PORTION, INGREDIENTS_IMAGES_PATH } from '../constants/ingredients-constants';

export const generateIngredientImageSrc = ({ ingredient, sandwich, imageType = 'swiper' }) => {
  const { imageBase, type, portion = DEFAULT_PORTION } = ingredient;

  const path = `${import.meta.env.VITE_API_SERVER}/${INGREDIENTS_IMAGES_PATH}`;

  const breadShape = sandwich.ingredients[0]?.shape || SHAPE.long;

  const breadImageIndex = imageType === 'swiper' || sandwich.ingredients.length < 2 ? 0 : 1;

  const suffix = {
    [TYPE.bread]: ['', '_sliced'][breadImageIndex],
    [TYPE.protein]: `_${breadShape}_${portion}`,
    [TYPE.cheese]: `_${breadShape}_${portion}`,
    [TYPE.toppings]: `_${breadShape}_${portion}`,
    [TYPE.condiments]: `_${breadShape}_${portion}`,
  };

  const extension = `.${EXTENSION}`;

  return path + imageBase + suffix[type] + extension;
};

export const groupIngredientsByTypes = (ingredients) => {
  const groupedByTypes = {};

  // Create arrays for each type in TYPE order
  for (const key in TYPE) {
    groupedByTypes[TYPE[key]] = [];
  }

  // Add each ingredient to the corresponding type array
  ingredients.forEach((ingredient) => {
    if (groupedByTypes.hasOwnProperty(ingredient.type)) {
      groupedByTypes[ingredient.type].push(ingredient);
    }
  });

  // Add any missing types to the end
  ingredients.forEach((ingredient) => {
    if (!groupedByTypes.hasOwnProperty(ingredient.type)) {
      groupedByTypes[ingredient.type] = [ingredient];
    }
  });

  return groupedByTypes;
};
