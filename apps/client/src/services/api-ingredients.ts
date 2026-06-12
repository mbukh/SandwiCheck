import type { ApiErrorResponse, DietaryPreference } from '@sandwicheck/shared';
import { INGREDIENTS_CACHE_TIME_OUT_MINS } from '@/constants/ingredients-constants';
import type { ApiResult } from '@/types/api';
import type { Ingredient } from '@/types/domain';
import { handleResponse } from '@/utils/api-utils';
import { createFetchApi } from '@/utils/fetch-api';
import { log, logResponse } from '@/utils/log';
import { readJsonFromStorage } from '@/utils/storage-utils';
import { timeDifference } from '@/utils/utils';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/ingredients`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

interface IngredientFilters {
  dietaryPreferences?: DietaryPreference[];
  type?: string;
  sortBy?: string;
}

interface IngredientFormData {
  name?: string;
  type?: string;
  dietaryPreferences?: string;
  shape?: string;
  displayPriority?: number | string;
  files?: Record<string, File | Blob | undefined>;
}

/**
 * Ingredients API Service
 *
 * Implements all ingredient management endpoints from the server API.
 * Handles ingredient CRUD operations with image upload support, plus client
 * caching for improved performance.
 *
 * Base URL: /api/v1/ingredients
 */

const fetchIngredients = async ({
  dietaryPreferences,
  type,
  sortBy,
}: IngredientFilters): Promise<ApiResult<Ingredient[]>> => {
  return await handleResponse<Ingredient[]>(async () => api.get('/', { params: { dietaryPreferences, type, sortBy } }));
};

/** GET / — all ingredients, with dietary filtering and client-side caching. */
export const getAllIngredients = async ({
  dietaryPreferences = [],
}: { dietaryPreferences?: DietaryPreference[] } = {}): Promise<{
  data: Ingredient[];
  error?: ApiErrorResponse['error'];
}> => {
  let ingredients = readIngredientsFromCache();
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
    } else {
      // Report the failure instead of masquerading as an empty catalog (dead builder + Randomize).
      return { data: [], error: res.error };
    }
  }

  if (dietaryPreferences && dietaryPreferences.length > 0) {
    ingredients = filterIngredientsByDietaryPreferences(ingredients, dietaryPreferences);
  }

  return { data: ingredients };
};

// UTILS //

function readIngredientsFromCache(): Ingredient[] | null {
  const ingredients = readJsonFromStorage<Ingredient[]>('ingredients');
  const cachedAt = readJsonFromStorage<number>('ingredients-cachedAt');

  if (!ingredients || cachedAt === null) return null;

  const cacheExpired = timeDifference(cachedAt, Date.now()).minutes > INGREDIENTS_CACHE_TIME_OUT_MINS;

  if (cacheExpired) return null;

  return ingredients;
}

function filterIngredientsByDietaryPreferences(
  ingredients: Ingredient[],
  dietaryPreferences: DietaryPreference[],
): Ingredient[] {
  if (dietaryPreferences.length === 0) {
    return ingredients;
  }

  return ingredients.filter((ingredient) =>
    dietaryPreferences.every((preference) => ingredient.dietaryPreferences.includes(preference)),
  );
}

/** GET /:ingredientId — single ingredient (public). */
export const fetchIngredientById = async (ingredientId: string): Promise<ApiResult<Ingredient>> => {
  return await handleResponse<Ingredient>(async () => api.get(`/${ingredientId}`));
};

/** POST / — create an ingredient (admin only). */
export const createIngredient = async (ingredientData: IngredientFormData): Promise<ApiResult<Ingredient>> => {
  const formData = new FormData();

  if (ingredientData.name) formData.append('name', ingredientData.name);
  if (ingredientData.type) formData.append('type', ingredientData.type);
  if (ingredientData.dietaryPreferences) formData.append('dietaryPreferences', ingredientData.dietaryPreferences);
  if (ingredientData.shape) formData.append('shape', ingredientData.shape);
  if (ingredientData.displayPriority) formData.append('displayPriority', String(ingredientData.displayPriority));

  if (ingredientData.files) {
    for (const fieldName of Object.keys(ingredientData.files)) {
      const file = ingredientData.files[fieldName];
      if (file) {
        formData.append(fieldName, file);
      }
    }
  }

  return await handleResponse<Ingredient>(async () => api.post('/', formData));
};

/** PUT /:ingredientId — update an ingredient (admin only). */
export const updateIngredient = async (
  ingredientId: string,
  ingredientData: IngredientFormData,
): Promise<ApiResult<Ingredient>> => {
  const formData = new FormData();

  if (ingredientData.name) formData.append('name', ingredientData.name);
  if (ingredientData.type) formData.append('type', ingredientData.type);
  if (ingredientData.dietaryPreferences) formData.append('dietaryPreferences', ingredientData.dietaryPreferences);
  if (ingredientData.shape) formData.append('shape', ingredientData.shape);
  if (ingredientData.displayPriority) formData.append('displayPriority', String(ingredientData.displayPriority));

  if (ingredientData.files) {
    for (const fieldName of Object.keys(ingredientData.files)) {
      const file = ingredientData.files[fieldName];
      if (file) {
        formData.append(fieldName, file);
      }
    }
  }

  return await handleResponse<Ingredient>(async () => api.put(`/${ingredientId}`, formData));
};

/** DELETE /:ingredientId — delete an ingredient (admin only). */
export const deleteIngredient = async (ingredientId: string): Promise<ApiResult> => {
  return await handleResponse(async () => api.delete(`/${ingredientId}`));
};
