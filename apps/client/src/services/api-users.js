import { createFetchApi } from '../utils/fetch-api';

import { log } from '../utils/log';

import { handleResponse } from '../utils/api-utils';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/users`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

/**
 * Users API Service
 *
 * Implements all user management endpoints from the server API.
 * Handles user profiles, favorites, week menus, and user relationships.
 *
 * Base URL: /api/v1/users
 *
 * UI IMPLEMENTATION STATUS: 22.2% (2/9 endpoints)
 * ✅ IMPLEMENTED (2):
 *   - fetchCurrentUser: AuthGlobalContext.jsx - Fetches authenticated user on app load
 *   - addSandwichToFavoritesByUserId: votes.js (voteForSandwich) - Automatically adds to favorites when voting
 * ❌ NOT IMPLEMENTED (7):
 *   - fetchUserById: API exists, used indirectly in use-gallery.js but not as direct UI feature (no user profile view)
 *   - updateUserById: API exists, no user profile/settings page (name, email, dietary prefs, profile picture)
 *   - deleteUserById: API exists, no delete account UI/button
 *   - removeSandwichFromFavoritesByUserId: API exists, favorites managed only via voting (one-way, no unvote)
 *   - addSandwichToWeekMenu: API exists, Cart.jsx is empty placeholder, no week menu UI
 *   - removeSandwichFromWeekMenu: API exists, Cart.jsx is empty placeholder, no week menu UI
 *   - fetchUsers: API exists, admin only, no admin interface/panel
 */

/**
 * Get current authenticated user
 * GET /current
 * Access: Private
 * Status: ✅ UI_IMPLEMENTED - Used in AuthGlobalContext.jsx
 * @returns {Promise<Object>} { success: boolean, data: user }
 */
export const fetchCurrentUser = async () => {
  return await handleResponse(async () => api.get(`/current`));
};

/**
 * Get user by ID
 * GET /:userId
 * Access: Private/User, Private/Parent
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but not used in any UI component
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, data: user }
 */
export const fetchUserById = async (userId) => {
  return await handleResponse(async () => api.get(`/${userId}`));
};

/**
 * Update user profile
 * PUT /:userId
 * Access: Private/User, Private/Parent
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no user profile/settings page
 * @param {string} userId - User ID
 * @param {Object} params - Update parameters
 * @param {string} [params.name] - User name
 * @param {string} [params.email] - User email
 * @param {string} [params.role] - User role
 * @param {string} [params.dietaryPreferences] - Dietary preferences
 * @param {string} [params.unlinkParentId] - Unlink parent ID
 * @param {string} [params.unlinkChildId] - Unlink child ID
 * @param {boolean} [params.removeProfilePicture] - Remove profile picture
 * @param {Object} [params.file] - Profile picture file
 * @returns {Promise<Object>} { success: boolean, data: updatedUser }
 */
export const updateUserById = async (
  userId,
  { name, email, role, dietaryPreferences, unlinkParentId, unlinkChildId, removeProfilePicture, file },
) => {
  const formData = new FormData();

  if (name) formData.append('name', name);
  if (email) formData.append('email', email);
  if (role) formData.append('role', role);
  if (dietaryPreferences) formData.append('dietaryPreferences', dietaryPreferences);
  if (unlinkParentId) formData.append('unlinkParentId', unlinkParentId);
  if (unlinkChildId) formData.append('unlinkChildId', unlinkChildId);
  if (removeProfilePicture) formData.append('removeProfilePicture', removeProfilePicture);
  if (file && file.imageBuffer) formData.append('file', file.imageBuffer, 'profile-picture.png');

  /*
   * Fetch wrapper automatically handles FormData headers (excludes Content-Type to let browser set boundary)
   * api.defaults.headers is still accessible for compatibility, but not needed here
   */
  return await handleResponse(async () => api.put(`/${userId}`, formData));
};

/**
 * Add sandwich to user favorites
 * POST /:userId/favorite-sandwiches/:sandwichId
 * Access: Private/User
 * Status: ✅ UI_IMPLEMENTED - Used in votes.js (voteForSandwich function)
 * @param {Object} params - Favorite parameters
 * @param {string} params.userId - User ID
 * @param {string} params.sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const addSandwichToFavoritesByUserId = async ({ userId, sandwichId }) => {
  return await handleResponse(async () => api.post(`/${userId}/favorite-sandwiches/${sandwichId}`));
};

/**
 * Remove sandwich from user favorites
 * DELETE /:userId/favorite-sandwiches/:sandwichId
 * Access: Private/User
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but not used (only add is implemented via voting)
 * @param {Object} params - Favorite parameters
 * @param {string} params.userId - User ID
 * @param {string} params.sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const removeSandwichFromFavoritesByUserId = async ({ userId, sandwichId }) => {
  return await handleResponse(async () => api.delete(`/${userId}/favorite-sandwiches/${sandwichId}`));
};

/**
 * Add sandwich to favorites in local storage (utility function)
 * @param {string} sandwichId - Sandwich ID
 */
export const addSandwichToFavoritesInLocalStorage = (sandwichId) => {
  const allVotesString = localStorage.getItem('user_votes');
  const allVotes = allVotesString ? JSON.parse(allVotesString) : [];
  allVotes.push(sandwichId);
  localStorage.setItem('user_votes', JSON.stringify([...new Set(allVotes)]));
};

/**
 * Check if user voted for sandwich using local storage (utility function)
 * @param {string} sandwichId - Sandwich ID
 * @returns {boolean} Whether user voted
 */
export const hasUserVotedForSandwichByIdUsingLocalStorage = (sandwichId) => {
  const allVotesString = localStorage.getItem('user_votes');
  if (!allVotesString) return false;

  const allVotes = JSON.parse(allVotesString);
  if (allVotes && allVotes.includes(sandwichId)) {
    log('User already voted locally');
    return true;
  }
  return false;
};

/**
 * Get all users (admin only)
 * GET /
 * Access: Private/Admin
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no admin interface
 * @returns {Promise<Object>} { success: boolean, data: [users] }
 */
export const fetchUsers = async () => {
  return await handleResponse(async () => api.get('/'));
};

/**
 * Add sandwich to user week menu
 * PUT /:userId/week-menu/:day
 * Access: Private/User, Private/Parent
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but Cart page is empty, no week menu UI
 * @param {Object} params - Week menu parameters
 * @param {string} params.userId - User ID
 * @param {string} params.day - Day of week
 * @param {string} params.sandwichId - Sandwich ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const addSandwichToWeekMenu = async ({ userId, day, sandwichId }) => {
  return await handleResponse(async () => api.put(`/${userId}/week-menu/${day}`, { sandwichId }));
};

/**
 * Remove sandwich from user week menu
 * DELETE /:userId/week-menu/:day
 * Access: Private/User, Private/Parent
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but Cart page is empty, no week menu UI
 * @param {Object} params - Week menu parameters
 * @param {string} params.userId - User ID
 * @param {string} params.day - Day of week
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const removeSandwichFromWeekMenu = async ({ userId, day }) => {
  return await handleResponse(async () => api.delete(`/${userId}/week-menu/${day}`));
};

/**
 * Delete user account
 * DELETE /:userId
 * Access: Private/User
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no delete account UI
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const deleteUserById = async (userId) => {
  return await handleResponse(async () => api.delete(`/${userId}`));
};
