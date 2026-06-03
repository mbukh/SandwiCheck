import type { CreateSandwichDto, DietaryPreference } from '@sandwicheck/shared';
import { SANDWICH_CACHE_TIME_OUT_DAYS } from '@/constants/sandwich-constants';
import type { ApiResult } from '@/types/api';
import type { BuilderSandwich, Sandwich } from '@/types/domain';
import { handleResponse } from '@/utils/api-utils';
import { createFetchApi } from '@/utils/fetch-api';
import { log } from '@/utils/log';
import { timeDifference } from '@/utils/utils';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/sandwiches`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

export interface SandwichQuery {
  dietaryPreferences?: DietaryPreference[];
  ingredients?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Sandwiches API Service
 *
 * Implements all sandwich management endpoints from the server API: creation,
 * retrieval, updates, deletion, and voting, plus client caching utilities.
 *
 * Base URL: /api/v1/sandwiches
 */

/** GET / — sandwiches with filtering and pagination (public). */
export const fetchSandwiches = async (query: SandwichQuery): Promise<ApiResult<Sandwich[]>> => {
  return await handleResponse<Sandwich[]>(async () => api.get('/', { params: { ...query } }));
};

/** GET /:sandwichId — single sandwich (public). */
export const fetchSandwichById = async (sandwichId: string): Promise<ApiResult<Sandwich>> => {
  return await handleResponse<Sandwich>(async () => api.get(`/${sandwichId}`));
};

/** POST / — create a sandwich (private). */
export const createSandwich = async (parameters: BuilderSandwich): Promise<ApiResult<Sandwich>> => {
  const payload = buildSandwichPayload(parameters);
  return await handleResponse<Sandwich>(async () => api.post('/', payload));
};

/** POST /:sandwichId/vote — cast a vote (private; also adds the sandwich to the caller's favorites, idempotent). */
export const addVoteToSandwich = async (sandwichId: string): Promise<ApiResult<Sandwich>> => {
  return await handleResponse<Sandwich>(async () => api.post(`/${sandwichId}/vote`));
};

/** PUT /:sandwichId — update a sandwich (private, owner). */
export const updateSandwich = async (
  sandwichId: string,
  updateData: CreateSandwichDto,
): Promise<ApiResult<Sandwich>> => {
  return await handleResponse<Sandwich>(async () => api.put(`/${sandwichId}`, updateData));
};

/** DELETE /:sandwichId — delete a sandwich (private, owner). */
export const deleteSandwich = async (sandwichId: string): Promise<ApiResult> => {
  return await handleResponse(async () => api.delete(`/${sandwichId}`));
};

/** Read the in-progress builder sandwich from cache, or null if expired/missing. */
export const readSandwichFromCache = (): BuilderSandwich | null => {
  log('🥪 💾 Reading sandwich from cache');

  const sandwichString = localStorage.getItem('sandwich');
  const cachedAtString = localStorage.getItem('sandwich-cachedAt');

  if (!sandwichString || !cachedAtString) {
    return null;
  }

  const sandwich = JSON.parse(sandwichString) as BuilderSandwich | null;
  const cachedAt = JSON.parse(cachedAtString) as number;

  const cacheExpired = timeDifference(cachedAt, Date.now()).days > SANDWICH_CACHE_TIME_OUT_DAYS;

  if (!sandwich || cacheExpired) {
    return null;
  }

  log('🥪 ⏰ Sandwich cache timeout is set to', SANDWICH_CACHE_TIME_OUT_DAYS, 'days');

  return sandwich;
};

/** Persist the in-progress builder sandwich to cache. */
export const updateSandwichInCache = (sandwich: BuilderSandwich): void => {
  log('Writing sandwich to cache');

  localStorage.setItem('sandwich', JSON.stringify(sandwich));
  localStorage.setItem('sandwich-cachedAt', JSON.stringify(Date.now()));
};

/** Remove the in-progress builder sandwich from cache. */
export const deleteSandwichFromCache = (): void => {
  log('Removing sandwich from cache');

  localStorage.removeItem('sandwich');
};

/** Normalize builder state into the API create/update payload. */
export const buildSandwichPayload = (sandwich: BuilderSandwich | null): CreateSandwichDto | null => {
  if (!sandwich) {
    return null;
  }

  const normalizedName = typeof sandwich.name === 'string' ? sandwich.name.trim() : sandwich.name;
  const normalizedComment =
    typeof sandwich.comment === 'string' && sandwich.comment.trim().length > 0 ? sandwich.comment.trim() : undefined;

  const normalizedIngredients = Array.isArray(sandwich.ingredients)
    ? sandwich.ingredients
        .filter((ingredient) => !ingredient.unconfirmed) // Filter out unconfirmed layers before saving
        .map(({ ingredientId, id, portion }) => ({
          ingredientId: ingredientId ?? id,
          portion,
        }))
    : [];

  return {
    name: normalizedName,
    comment: normalizedComment,
    ingredients: normalizedIngredients,
  };
};
