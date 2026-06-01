/**
 * Utilities for managing layer instance IDs.
 * Layer instance IDs ensure that added layers can be uniquely identified
 * and managed independently, even when they share the same ingredient ID.
 */
import type { SandwichLayer } from '@/types/domain';

/**
 * Creates a unique layer instance ID.
 * Uses `crypto.randomUUID()` if available, otherwise falls back to a timestamp-based ID.
 */
const createLayerInstanceId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Ensures an ingredient has a layer instance ID.
 * When `forceNew` is true, always creates a fresh ID (for reset/randomize).
 */
export const withLayerInstanceId = (ingredient: SandwichLayer, forceNew = false): SandwichLayer => {
  if (forceNew) {
    const { layerInstanceId: _layerInstanceId, ...ingredientWithoutId } = ingredient;
    return { ...ingredientWithoutId, layerInstanceId: createLayerInstanceId() };
  }
  return ingredient.layerInstanceId ? ingredient : { ...ingredient, layerInstanceId: createLayerInstanceId() };
};

/** Ensures all ingredients in an array have layer instance IDs. */
export const ensureLayerInstanceIds = (ingredients: SandwichLayer[] = [], forceNew = false): SandwichLayer[] =>
  ingredients.map((ingredient) => withLayerInstanceId(ingredient, forceNew));

/**
 * Gets the target layer ID for operations (removal, movement, etc.).
 * Prefers `layerInstanceId` over `id` for proper layer management.
 */
export const getLayerTargetId = (ingredient: SandwichLayer | undefined): string | undefined => {
  if (!ingredient) return undefined;
  return ingredient.layerInstanceId ?? ingredient.id;
};
