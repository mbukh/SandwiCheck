import type { UpdateUserDto } from '@sandwicheck/shared';
import type { ApiResult } from '@/types/api';
import type { DayMenuItem, User } from '@/types/domain';
import { handleResponse } from '@/utils/api-utils';
import { createFetchApi } from '@/utils/fetch-api';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/users`, {
  'Content-Type': 'application/json',
});

interface UpdateUserParams extends UpdateUserDto {
  file?: { imageBuffer?: Blob };
}

/**
 * Users API Service
 *
 * Implements all user management endpoints from the server API: profiles,
 * week menus, and user relationships. (Favoriting is owned by the vote endpoint
 * in api-sandwiches.ts — voting a sandwich adds it to the user's favorites.)
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
  /*
   * Repeat the field once per value: multer/multipart delivers repeated keys as an array,
   * which the server stores into the [String] enum. String(array) sent one bogus "a,b" value.
   */
  if (dietaryPreferences) {
    for (const preference of dietaryPreferences) {
      formData.append('dietaryPreferences', preference);
    }
  }
  if (unlinkParentId) formData.append('unlinkParentId', unlinkParentId);
  if (unlinkChildId) formData.append('unlinkChildId', unlinkChildId);
  if (removeProfilePicture) formData.append('removeProfilePicture', String(removeProfilePicture));
  // Field name must match upload.single('profilePicture') on the server, or the file is dropped.
  if (file && file.imageBuffer) formData.append('profilePicture', file.imageBuffer, 'profile-picture.png');

  return await handleResponse<User>(async () => api.put(`/${userId}`, formData));
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
  sandwichId,
}: {
  userId: string;
  day: string;
  sandwichId: string;
}): Promise<ApiResult<DayMenuItem[]>> => {
  // The server requires sandwichId in the request body (which sandwich to pull from the day).
  return await handleResponse<DayMenuItem[]>(async () => api.delete(`/${userId}/week-menu/${day}`, { sandwichId }));
};

/** DELETE /:userId — delete a user account (private, self). */
export const deleteUserById = async (userId: string): Promise<ApiResult> => {
  return await handleResponse(async () => api.delete(`/${userId}`));
};
