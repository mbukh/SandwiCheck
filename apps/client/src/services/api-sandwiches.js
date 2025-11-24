import { createFetchApi } from '../utils/fetch-api';

import { SANDWICH_CACHE_TIME_OUT_DAYS } from '../constants/sandwich-constants';

import { log } from '../utils/log';

import { timeDifference } from '../utils/utils';

import { handleResponse } from '../utils/api-utils';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/sandwiches`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

/**
 * Sandwiches API Service
 *
 * Implements all sandwich management endpoints from the server API.
 * Handles sandwich creation, retrieval, updates, deletion, and voting.
 * Includes caching utilities for improved performance.
 *
 * Base URL: /api/v1/sandwiches
 *
 * UI IMPLEMENTATION STATUS: 57.1% (4/7 endpoints)
 * ✅ IMPLEMENTED (4):
 *   - fetchSandwiches: SandwichGallery.jsx, use-gallery.js - Gallery with filtering (dietary, sort, pagination)
 *   - fetchSandwichById: useSandwich hook - Fetches single sandwich for detail view
 *   - createSandwich: SandwichContext.jsx (saveSandwich), SandwichSaveForm.jsx - Full creation flow with builder
 *   - addVoteToSandwich: votes.js (voteForSandwich), SandwichCard.jsx - Vote button with state management
 * ❌ NOT IMPLEMENTED (3):
 *   - updateSandwich: API exists, no edit UI (users can copy sandwich to builder but cannot edit existing)
 *   - deleteSandwich: API exists, no delete button/action in sandwich cards or detail view
 *   - removeVoteFromSandwich: API exists, voting is one-way only (no unvote functionality)
 */

/**
 * Get sandwiches with filtering and pagination
 * GET /
 * Access: Public
 * Status: ✅ UI_IMPLEMENTED - Used in SandwichGallery.jsx
 * @param {Object} query - Query parameters
 * @param {string[]} [query.dietaryPreferences] - Dietary preferences filter
 * @param {string[]} [query.ingredients] - Ingredients filter
 * @param {string} [query.sortBy] - Sort by field (createdAt, votesCount)
 * @param {number} [query.page] - Page number
 * @param {number} [query.limit] - Items per page
 * @returns {Promise<Object>} { success: boolean, data: [sandwiches], pagination: {...} }
 */
export const fetchSandwiches = async (query) => {
  return await handleResponse(async () => api.get('/', { params: query }));
};

/**
 * Get sandwich by ID
 * GET /:sandwichId
 * Access: Public
 * Status: ✅ UI_IMPLEMENTED - Used in useSandwich hook
 * @param {string} sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, data: sandwich }
 */
export const fetchSandwichById = async (sandwichId) => {
  return await handleResponse(async () => api.get(`/${sandwichId}`));
};

/**
 * Create new sandwich
 * POST /
 * Access: Private
 * Status: ✅ UI_IMPLEMENTED - Used in SandwichContext.jsx (saveSandwich), SandwichSaveForm.jsx
 * @param {Object} params - Sandwich creation parameters
 * @param {string} params.name - Sandwich name
 * @param {string[]} params.ingredients - Ingredient IDs
 * @param {string} [params.comment] - Optional comment
 * @returns {Promise<Object>} { success: boolean, data: sandwich }
 */
export const createSandwich = async (parameters) => {
  return await handleResponse(async () => api.post('/', parameters));
};

/**
 * Add vote to sandwich
 * POST /:sandwichId/vote
 * Access: Private
 * Status: ✅ UI_IMPLEMENTED - Used in votes.js (voteForSandwich), SandwichCard.jsx
 * @param {string} sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const addVoteToSandwich = async (sandwichId) => {
  return await handleResponse(async () => api.post(`/${sandwichId}/vote`));
};

/**
 * Remove vote from sandwich
 * DELETE /:sandwichId/vote
 * Access: Private
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but not used (only add is implemented)
 * @param {string} sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const removeVoteFromSandwich = async (sandwichId) => {
  return await handleResponse(async () => api.delete(`/${sandwichId}/vote`));
};

/**
 * Update sandwich
 * PUT /:sandwichId
 * Access: Private
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no edit UI
 * @param {string} sandwichId - Sandwich ID
 * @param {Object} updateData - Update parameters
 * @param {string} [updateData.name] - Sandwich name
 * @param {string[]} [updateData.ingredients] - Ingredient IDs
 * @param {string} [updateData.comment] - Comment
 * @returns {Promise<Object>} { success: boolean, data: updatedSandwich }
 */
export const updateSandwich = async (sandwichId, updateData) => {
  return await handleResponse(async () => api.put(`/${sandwichId}`, updateData));
};

/**
 * Delete sandwich
 * DELETE /:sandwichId
 * Access: Private
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no delete UI
 * @param {string} sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const deleteSandwich = async (sandwichId) => {
  return await handleResponse(async () => api.delete(`/${sandwichId}`));
};

/**
 * Read sandwich from cache (utility function)
 * @returns {Object|null} Cached sandwich or null if expired/not found
 */
export const readSandwichFromCache = () => {
  log('🥪 💾 Reading sandwich from cache');

  const sandwichString = localStorage.getItem('sandwich');
  const cachedAtString = localStorage.getItem('sandwich-cachedAt');

  if (!sandwichString || !cachedAtString) {
    return null;
  }

  const sandwich = JSON.parse(sandwichString);
  const cachedAt = JSON.parse(cachedAtString);

  const cacheExpired = timeDifference(cachedAt, Date.now()).days > SANDWICH_CACHE_TIME_OUT_DAYS;

  if (!sandwich || cacheExpired) {
    return null;
  }

  log('🥪 ⏰ Sandwich cache timeout is set to', SANDWICH_CACHE_TIME_OUT_DAYS, 'days');

  return sandwich;
};

/**
 * Update sandwich in cache (utility function)
 * @param {Object} sandwich - Sandwich data to cache
 */
export const updateSandwichInCache = (sandwich) => {
  log('Writing sandwich to cache');

  localStorage.setItem('sandwich', JSON.stringify(sandwich));
  localStorage.setItem('sandwich-cachedAt', JSON.stringify(Date.now()));
};

/**
 * Delete sandwich from cache (utility function)
 */
export const deleteSandwichFromCache = () => {
  log('Removing sandwich from cache');

  localStorage.removeItem('sandwich');
};
