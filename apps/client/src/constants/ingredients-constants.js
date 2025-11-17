export const INGREDIENTS_IMAGES_PATH = 'uploads/ingredients/';

export const TYPE = {
  bread: 'bread',
  protein: 'protein',
  cheese: 'cheese',
  toppings: 'toppings',
  condiments: 'condiments',
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

export const isBreadType = (type) => type === TYPE.bread;

export const EXTENSION = 'png';

export const INGREDIENTS_CACHE_TIME_OUT_MINS = 5;

export const PRODUCT = {
  meat: 'meat',
  fish: 'fish',
  dairy: 'dairy',
};
