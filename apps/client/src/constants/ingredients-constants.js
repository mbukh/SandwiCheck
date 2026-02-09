export const INGREDIENTS_IMAGES_PATH = 'uploads/ingredients/';

export const TYPE = {
  bread: 'bread',
  protein: 'protein',
  cheese: 'cheese',
  toppings: 'toppings',
  condiments: 'condiments',
};

/** Order for "next type" when adding a layer: bread → protein → cheese → toppings → condiments */
export const TYPE_ORDER = [TYPE.bread, TYPE.protein, TYPE.cheese, TYPE.toppings, TYPE.condiments];

/**
 * Returns the next ingredient type after topType for add-layer flow.
 * bread→protein→cheese→toppings→condiments; condiments returns condiments.
 */
export const getNextIngredientType = (topType) => {
  const i = TYPE_ORDER.indexOf(topType);
  if (i < 0 || i >= TYPE_ORDER.length - 1) return TYPE_ORDER[TYPE_ORDER.length - 1];
  return TYPE_ORDER[i + 1];
};

export const DIETARY_PREFERENCE = {
  vegetarian: 'vegetarian',
  kosher: 'kosher',
  halal: 'halal',
  vegan: 'vegan',
};

export const SHAPE = {
  long: 'long',
  round: 'round',
  trapezoid: 'trapezoid',
};

export const PORTION = {
  half: 'half',
  full: 'full',
  double: 'double',
};
export const DEFAULT_PORTION = PORTION.full;

/** Cycle to next portion: half→full→double→half. */
export const getNextPortion = (currentPortion) => {
  const portionValues = Object.values(PORTION);
  const currentIndex = portionValues.indexOf(currentPortion);
  if (currentIndex < 0 || currentIndex >= portionValues.length - 1) return portionValues[0];
  return portionValues[currentIndex + 1];
};

export const isBreadType = (type) => type === TYPE.bread;

export const EXTENSION = 'png';

export const INGREDIENTS_CACHE_TIME_OUT_MINS = 5;

export const PRODUCT = {
  meat: 'meat',
  fish: 'fish',
  dairy: 'dairy',
};
