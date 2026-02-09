/**
 * Utilities for managing layer instance IDs.
 * Layer instance IDs ensure that added layers can be uniquely identified
 * and managed independently, even when they share the same ingredient ID.
 */

/**
 * Creates a unique layer instance ID.
 * Uses crypto.randomUUID() if available, otherwise falls back to a timestamp-based ID.
 * @returns {string} Unique layer instance ID
 */
export const createLayerInstanceId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Ensures an ingredient has a layer instance ID.
 * @param {Object} ingredient - Ingredient object
 * @param {boolean} [forceNew=false] - If true, always creates a new ID (strips existing one)
 * @returns {Object} Ingredient with layerInstanceId
 */
export const withLayerInstanceId = (ingredient, forceNew = false) => {
  if (!ingredient) {
    return ingredient;
  }
  // If forceNew is true, always create a new layerInstanceId (for reset/randomize)
  if (forceNew) {
    const { layerInstanceId: _layerInstanceId, ...ingredientWithoutId } = ingredient;
    return { ...ingredientWithoutId, layerInstanceId: createLayerInstanceId() };
  }
  return ingredient.layerInstanceId ? ingredient : { ...ingredient, layerInstanceId: createLayerInstanceId() };
};

/**
 * Ensures all ingredients in an array have layer instance IDs.
 * @param {Array} ingredients - Array of ingredient objects
 * @param {boolean} [forceNew=false] - If true, always creates new IDs for all ingredients
 * @returns {Array} Array of ingredients with layerInstanceIds
 */
export const ensureLayerInstanceIds = (ingredients = [], forceNew = false) =>
  ingredients.map((ing) => withLayerInstanceId(ing, forceNew));

/**
 * Gets the target layer ID for operations (removal, movement, etc.).
 * Prefers layerInstanceId over id for proper layer management.
 * @param {Object} ingredient - Ingredient object
 * @returns {string|undefined} Layer ID to use for operations
 */
export const getLayerTargetId = (ingredient) => {
  if (!ingredient) return;
  return ingredient.layerInstanceId ?? ingredient.id;
};
