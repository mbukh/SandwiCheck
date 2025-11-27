import { INGREDIENTS_CACHE_TIME_OUT_MINS } from '../constants/ingredients-constants';
import { handleResponse } from '../utils/api-utils';
import { createFetchApi } from '../utils/fetch-api';
import { log, logResponse } from '../utils/log';
import { timeDifference } from '../utils/utils';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/ingredients`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

/**
 * Ingredients API Service
 *
 * Implements all ingredient management endpoints from the server API.
 * Handles ingredient CRUD operations with image upload support.
 * Includes caching utilities for improved performance.
 *
 * Base URL: /api/v1/ingredients
 *
 * UI IMPLEMENTATION STATUS: 20% (1/5 endpoints)
 * ✅ IMPLEMENTED (1):
 *   - getAllIngredients: IngredientsGlobalContext.jsx - Fetches all ingredients with dietary filtering and caching
 * ❌ NOT IMPLEMENTED (4):
 *   - fetchIngredientById: API exists, not used in any UI component (ingredients accessed from context)
 *   - createIngredient: API exists, admin only, no admin interface/panel
 *   - updateIngredient: API exists, admin only, no admin interface/panel
 *   - deleteIngredient: API exists, admin only, no admin interface/panel
 */

const fetchIngredients = async ({ dietaryPreferences, type, sortBy }) => {
  return await handleResponse(async () => api.get('/', { params: { dietaryPreferences, type, sortBy } }));
};

// =================

/**
 * Get all ingredients with filtering and caching
 * GET /
 * Access: Public
 * Status: ✅ UI_IMPLEMENTED - Used in IngredientsGlobalContext.jsx
 * @param {Object} params - Filter parameters
 * @param {string[]} params.dietaryPreferences - Dietary preferences filter
 * @returns {Promise<Object>} { data: [ingredients] }
 */
export const getAllIngredients = async ({ dietaryPreferences = [] } = {}) => {
  let ingredients;

  ingredients = readIngredientsFromCache();
  if (ingredients) {
    log('📝 💾 Read ingredients from cache', ingredients);
    log('📝 ⏰ Ingredients cache timeout is set to', INGREDIENTS_CACHE_TIME_OUT_MINS, 'minutes.');
  } else {
    const res = await fetchIngredients({});
    logResponse('📝 Fetch ingredients', res);

    if (res.data) {
      ingredients = res.data;

      localStorage.setItem('ingredients', JSON.stringify(ingredients));
      localStorage.setItem('ingredients-cachedAt', JSON.stringify(Date.now()));
    }
  }

  if (!ingredients) {
    return { data: [] };
  }

  if (dietaryPreferences && dietaryPreferences.length > 0) {
    ingredients = filterIngredientsByDietaryPreferences(ingredients, dietaryPreferences);
  }

  return { data: ingredients };
};

// UTILS //

function readIngredientsFromCache() {
  const ingredientsString = localStorage.getItem('ingredients');
  const cachedAtString = localStorage.getItem('ingredients-cachedAt');

  if (!ingredientsString || !cachedAtString) return null;

  const ingredients = JSON.parse(ingredientsString);
  const cachedAt = JSON.parse(cachedAtString);

  if (!ingredients) return null;

  const cacheExpired = timeDifference(cachedAt, Date.now()).minutes > INGREDIENTS_CACHE_TIME_OUT_MINS;

  if (cacheExpired) return null;

  return ingredients;
}

function filterIngredientsByDietaryPreferences(ingredients, dietaryPreferences) {
  if (dietaryPreferences.length === 0) {
    return ingredients;
  }

  return ingredients.filter((ingredient) =>
    dietaryPreferences.every((preference) => ingredient.dietaryPreferences.includes(preference)),
  );
}

/**
 * Get ingredient by ID
 * GET /:ingredientId
 * Access: Public
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but not used in any UI component
 * @param {string} ingredientId - Ingredient ID
 * @returns {Promise<Object>} { success: boolean, data: ingredient }
 */
export const fetchIngredientById = async (ingredientId) => {
  return await handleResponse(async () => api.get(`/${ingredientId}`));
};

/**
 * Create new ingredient (admin only)
 * POST /
 * Access: Private/Admin
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no admin interface
 * @param {Object} ingredientData - Ingredient creation parameters
 * @param {string} ingredientData.name - Ingredient name
 * @param {string} ingredientData.type - Ingredient type
 * @param {string} ingredientData.dietaryPreferences - Dietary preferences
 * @param {string} ingredientData.shape - Ingredient shape
 * @param {number} ingredientData.displayPriority - Display priority
 * @param {Object} [ingredientData.files] - Image files
 * @returns {Promise<Object>} { success: boolean, data: ingredient }
 */
export const createIngredient = async (ingredientData) => {
  const formData = new FormData();

  // Add basic fields
  if (ingredientData.name) formData.append('name', ingredientData.name);
  if (ingredientData.type) formData.append('type', ingredientData.type);
  if (ingredientData.dietaryPreferences) formData.append('dietaryPreferences', ingredientData.dietaryPreferences);
  if (ingredientData.shape) formData.append('shape', ingredientData.shape);
  if (ingredientData.displayPriority) formData.append('displayPriority', ingredientData.displayPriority);

  // Add image files if provided
  if (ingredientData.files) {
    for (const fieldName of Object.keys(ingredientData.files)) {
      if (ingredientData.files[fieldName]) {
        formData.append(fieldName, ingredientData.files[fieldName]);
      }
    }
  }

  return await handleResponse(async () => api.post('/', formData));
};

/**
 * Update ingredient (admin only)
 * PUT /:ingredientId
 * Access: Private/Admin
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no admin interface
 * @param {string} ingredientId - Ingredient ID
 * @param {Object} ingredientData - Ingredient update parameters
 * @param {string} [ingredientData.name] - Ingredient name
 * @param {string} [ingredientData.type] - Ingredient type
 * @param {string} [ingredientData.dietaryPreferences] - Dietary preferences
 * @param {string} [ingredientData.shape] - Ingredient shape
 * @param {number} [ingredientData.displayPriority] - Display priority
 * @param {Object} [ingredientData.files] - Image files
 * @returns {Promise<Object>} { success: boolean, data: updatedIngredient }
 */
export const updateIngredient = async (ingredientId, ingredientData) => {
  const formData = new FormData();

  // Add basic fields
  if (ingredientData.name) formData.append('name', ingredientData.name);
  if (ingredientData.type) formData.append('type', ingredientData.type);
  if (ingredientData.dietaryPreferences) formData.append('dietaryPreferences', ingredientData.dietaryPreferences);
  if (ingredientData.shape) formData.append('shape', ingredientData.shape);
  if (ingredientData.displayPriority) formData.append('displayPriority', ingredientData.displayPriority);

  // Add image files if provided
  if (ingredientData.files) {
    for (const fieldName of Object.keys(ingredientData.files)) {
      if (ingredientData.files[fieldName]) {
        formData.append(fieldName, ingredientData.files[fieldName]);
      }
    }
  }

  return await handleResponse(async () => api.put(`/${ingredientId}`, formData));
};

/**
 * Delete ingredient (admin only)
 * DELETE /:ingredientId
 * Access: Private/Admin
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no admin interface
 * @param {string} ingredientId - Ingredient ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const deleteIngredient = async (ingredientId) => {
  return await handleResponse(async () => api.delete(`/${ingredientId}`));
};
