/*
 * SHARED-READY: ingredient domain value sets + derived types.
 * TYPE, DIETARY_PREFERENCE, SHAPE, PORTION, PRODUCT and their derived union types
 * are framework-agnostic domain vocabulary already duplicated on the client
 * (apps/client/src/constants/ingredients-constants.js). Move these to
 * packages/shared so client and server share one source of truth.
 * NOTE on divergence to reconcile when detaching:
 *   - The client's DIETARY_PREFERENCE has only { vegetarian, kosher, halal, vegan }
 *     and keeps meat/fish/dairy under PRODUCT only; the server folds meat/dairy/fish
 *     into DIETARY_PREFERENCE as well. Pick one canonical shape before sharing.
 * The IMAGE_FIELDS* tables and image helpers below are server-only (image pipeline)
 * and should NOT move to shared.
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

// SERVER-ONLY: image-pipeline field tables — do not move to packages/shared.
export const IMAGE_FIELDS = [
  {
    fieldName: 'imageLongDouble',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.long}_${PORTION.double}`,
  },
  {
    fieldName: 'imageLongFull',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.long}_${PORTION.full}`,
  },
  {
    fieldName: 'imageLongHalf',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.long}_${PORTION.half}`,
  },
  {
    fieldName: 'imageRoundDouble',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.round}_${PORTION.double}`,
  },
  {
    fieldName: 'imageRoundFull',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.round}_${PORTION.full}`,
  },
  {
    fieldName: 'imageRoundHalf',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.round}_${PORTION.half}`,
  },
  {
    fieldName: 'imageTrapezoidDouble',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.double}`,
  },
  {
    fieldName: 'imageTrapezoidFull',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.full}`,
  },
  {
    fieldName: 'imageTrapezoidHalf',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.half}`,
  },
];

export const IMAGE_FIELDS_BREAD = [
  {
    fieldName: 'imageBread',
    title: `whole unsliced bread`,
    suffix: ``,
  },
  {
    fieldName: 'imageBreadSliced',
    title: `sliced bread`,
    suffix: `_sliced`,
  },
];

export const ALL_IMAGE_FIELDS = [...IMAGE_FIELDS, ...IMAGE_FIELDS_BREAD];

export const imageFieldsByType = (type: string): { fieldName: string; title: string; suffix: string }[] => {
  return isBreadType(type) ? IMAGE_FIELDS_BREAD : IMAGE_FIELDS;
};

export const isBreadType = (type: string): boolean => type === TYPE.bread;

export const PRODUCT = {
  meat: 'meat',
  fish: 'fish',
  dairy: 'dairy',
} as const;

export type Product = (typeof PRODUCT)[keyof typeof PRODUCT];

/** Full set of values accepted by an ingredient's `type` field (categories + product kinds). */
export type IngredientType = IngredientCategory | Product;
