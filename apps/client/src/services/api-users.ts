import type { UpdateUserDto } from '@sandwicheck/shared';
import type { ApiResult } from '@/types/api';
import type { DayMenuItem, User } from '@/types/domain';
import { handleResponse } from '@/utils/api-utils';
import { createFetchApi } from '@/utils/fetch-api';
import { log } from '@/utils/log';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/users`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

interface UpdateUserParams extends UpdateUserDto {
  file?: { imageBuffer?: Blob };
}

/**
 * Users API Service
 *
 * Implements all user management endpoints from the server API: profiles,
 * favorites, week menus, and user relationships.
 *
 * Base URL: /api/v1/users
 */

/** GET /current — the authenticated user. */
export const fetchCurrentUser = async (): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => api.get(`/current`));
};

/** GET /:userId — a user by id (private, self or parent). */
export const fetchUserById = async (userId: string): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => api.get(`/${userId}`));
};

/** PUT /:userId — update a user profile (private, self or parent). */
export const updateUserById = async (
  userId: string,
  {
    name,
    email,
    role,
    dietaryPreferences,
    unlinkParentId,
    unlinkChildId,
    removeProfilePicture,
    file,
  }: UpdateUserParams,
): Promise<ApiResult<User>> => {
  const formData = new FormData();

  if (name) formData.append('name', name);
  if (email) formData.append('email', email);
  if (role) formData.append('role', role);
  if (dietaryPreferences) formData.append('dietaryPreferences', String(dietaryPreferences));
  if (unlinkParentId) formData.append('unlinkParentId', unlinkParentId);
  if (unlinkChildId) formData.append('unlinkChildId', unlinkChildId);
  if (removeProfilePicture) formData.append('removeProfilePicture', String(removeProfilePicture));
  if (file && file.imageBuffer) formData.append('file', file.imageBuffer, 'profile-picture.png');

  return await handleResponse<User>(async () => api.put(`/${userId}`, formData));
};

/** POST /:userId/favorite-sandwiches/:sandwichId — favorite a sandwich (private). */
export const addSandwichToFavoritesByUserId = async ({
  userId,
  sandwichId,
}: {
  userId: string;
  sandwichId: string;
}): Promise<ApiResult<string[]>> => {
  return await handleResponse<string[]>(async () => api.post(`/${userId}/favorite-sandwiches/${sandwichId}`));
};

/** DELETE /:userId/favorite-sandwiches/:sandwichId — unfavorite a sandwich (private). */
export const removeSandwichFromFavoritesByUserId = async ({
  userId,
  sandwichId,
}: {
  userId: string;
  sandwichId: string;
}): Promise<ApiResult<string[]>> => {
  return await handleResponse<string[]>(async () => api.delete(`/${userId}/favorite-sandwiches/${sandwichId}`));
};

/** Record a local vote for a sandwich (for logged-out users). */
export const addSandwichToFavoritesInLocalStorage = (sandwichId: string): void => {
  const allVotesString = localStorage.getItem('user_votes');
  const allVotes: string[] = allVotesString ? JSON.parse(allVotesString) : [];
  allVotes.push(sandwichId);
  localStorage.setItem('user_votes', JSON.stringify([...new Set(allVotes)]));
};

/** Check whether a sandwich was voted for locally (for logged-out users). */
export const hasUserVotedForSandwichByIdUsingLocalStorage = (sandwichId: string): boolean => {
  const allVotesString = localStorage.getItem('user_votes');
  if (!allVotesString) return false;

  const allVotes = JSON.parse(allVotesString) as string[] | null;
  if (allVotes && allVotes.includes(sandwichId)) {
    log('User already voted locally');
    return true;
  }
  return false;
};

/** GET / — all users (admin only). */
export const fetchUsers = async (): Promise<ApiResult<User[]>> => {
  return await handleResponse<User[]>(async () => api.get('/'));
};

/** PUT /:userId/week-menu/:day — add a sandwich to a day's menu (private). */
export const addSandwichToWeekMenu = async ({
  userId,
  day,
  sandwichId,
}: {
  userId: string;
  day: string;
  sandwichId: string;
}): Promise<ApiResult<DayMenuItem[]>> => {
  return await handleResponse<DayMenuItem[]>(async () => api.put(`/${userId}/week-menu/${day}`, { sandwichId }));
};

/** DELETE /:userId/week-menu/:day — remove a sandwich from a day's menu (private). */
export const removeSandwichFromWeekMenu = async ({
  userId,
  day,
}: {
  userId: string;
  day: string;
}): Promise<ApiResult<DayMenuItem[]>> => {
  return await handleResponse<DayMenuItem[]>(async () => api.delete(`/${userId}/week-menu/${day}`));
};

/** DELETE /:userId — delete a user account (private, self). */
export const deleteUserById = async (userId: string): Promise<ApiResult> => {
  return await handleResponse(async () => api.delete(`/${userId}`));
};
