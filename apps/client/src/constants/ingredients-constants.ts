/*
 * CLIENT-ONLY ingredient UI helpers: add-layer type ordering, portion cycling,
 * image paths and cache TTL. The ingredient domain vocabulary (TYPE, PORTION,
 * DIETARY_PREFERENCE, isBreadType, …) lives in @sandwicheck/shared — import it
 * from there directly.
 */
import { type IngredientCategory, type IngredientType, PORTION, type Portion, TYPE } from '@sandwicheck/shared';

export const INGREDIENTS_IMAGES_PATH = 'uploads/ingredients/';

/** Order for "next type" when adding a layer: bread → protein → cheese → toppings → condiments */
const TYPE_ORDER: IngredientCategory[] = [TYPE.bread, TYPE.protein, TYPE.cheese, TYPE.toppings, TYPE.condiments];

/**
 * Returns the next ingredient type after topType for the add-layer flow.
 * bread→protein→cheese→toppings→condiments; condiments returns condiments.
 */
export const getNextIngredientType = (topType: IngredientType): IngredientType => {
  const i = TYPE_ORDER.indexOf(topType as IngredientCategory);
  if (i === -1 || i >= TYPE_ORDER.length - 1) return TYPE.condiments;
  return TYPE_ORDER[i + 1] ?? TYPE.condiments;
};

export const DEFAULT_PORTION = PORTION.full;

/** Portion cycle order used by the portion toggle: half → full → double → half. */
const PORTION_CYCLE = [PORTION.half, PORTION.full, PORTION.double] as const;

/** Cycle to the next portion: half→full→double→half. */
export const getNextPortion = (currentPortion: Portion | undefined): Portion => {
  const currentIndex = currentPortion ? PORTION_CYCLE.indexOf(currentPortion) : -1;
  if (currentIndex === -1 || currentIndex >= PORTION_CYCLE.length - 1) return PORTION_CYCLE[0];
  return PORTION_CYCLE[currentIndex + 1] ?? PORTION_CYCLE[0];
};

export const EXTENSION = 'png';

export const INGREDIENTS_CACHE_TIME_OUT_MINS = 5;
