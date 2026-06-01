/*
 * Ingredient domain value sets + derived types.
 * Framework-agnostic vocabulary shared by the client builder UI and the server
 * Mongoose validators so both stay in lockstep. Server-only concerns (the image
 * pipeline field tables) intentionally stay in apps/server/constants.
 *
 * Canonical reconciliations (server form wins):
 *   - DIETARY_PREFERENCE is the full 7-value set (vegetarian/kosher/halal/vegan +
 *     meat/dairy/fish). The client builder may surface a UI subset for filtering.
 */
export const TYPE = {
  bread: 'bread',
  protein: 'protein',
  cheese: 'cheese',
  toppings: 'toppings',
  condiments: 'condiments',
} as const;

export type IngredientCategory = (typeof TYPE)[keyof typeof TYPE];

export const DIETARY_PREFERENCE = {
  vegetarian: 'vegetarian',
  kosher: 'kosher',
  halal: 'halal',
  vegan: 'vegan',
  meat: 'meat',
  dairy: 'dairy',
  fish: 'fish',
} as const;

export type DietaryPreference = (typeof DIETARY_PREFERENCE)[keyof typeof DIETARY_PREFERENCE];

export const SHAPE = {
  long: 'long',
  round: 'round',
  trapezoid: 'trapezoid',
} as const;

export type Shape = (typeof SHAPE)[keyof typeof SHAPE];

export const PORTION = {
  full: 'full',
  half: 'half',
  double: 'double',
} as const;

export type Portion = (typeof PORTION)[keyof typeof PORTION];

export const PRODUCT = {
  meat: 'meat',
  fish: 'fish',
  dairy: 'dairy',
} as const;

export type Product = (typeof PRODUCT)[keyof typeof PRODUCT];

/** Full set of values accepted by an ingredient's `type` field (categories + product kinds). */
export type IngredientType = IngredientCategory | Product;

export const isBreadType = (type: string): boolean => type === TYPE.bread;
