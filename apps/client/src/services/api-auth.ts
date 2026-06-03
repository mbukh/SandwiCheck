import type {
  ChangePasswordDto,
  CreateChildDto,
  CreateInviteData,
  ForgotPasswordDto,
  LoginChildDto,
  LoginDto,
  SignupDto,
} from '@sandwicheck/shared';
import type { ApiResult } from '@/types/api';
import type { Session, User } from '@/types/domain';
import { handleResponse } from '@/utils/api-utils';
import { createFetchApi } from '@/utils/fetch-api';

const api = createFetchApi(`${import.meta.env.VITE_API_SERVER}/api/v1/auth`, {
  'Access-Control-Allow-Origin': import.meta.env.VITE_HOST,
  'Content-Type': 'application/json',
});

/**
 * Authentication API Service
 *
 * Implements all authentication-related endpoints from the server API.
 * Handles user registration, login, email confirmation, password management,
 * and parent-child user relationships.
 *
 * Base URL: /api/v1/auth
 */

/** POST /signup — register a new user (optionally under a parent invite token). */
export const signup = async ({ email, password, name, role, inviteToken }: SignupDto): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => {
    return api.post('/signup', { email, password, name, role, inviteToken });
  });
};

/** POST /login — log in with email/password (optionally under a parent invite token). */
export const login = async ({ email, password, inviteToken }: LoginDto): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => {
    return api.post('/login', { email, password, inviteToken });
  });
};

/** POST /create-invite — issue a parent invite token (parent only). */
export const createInvite = async (): Promise<ApiResult<CreateInviteData>> => {
  return await handleResponse<CreateInviteData>(async () => api.post('/create-invite'));
};

/** GET /session — active authenticated session details. */
export const getSession = async (): Promise<ApiResult<Session>> => {
  return await handleResponse<Session>(async () => {
    return api.get('/session');
  });
};

/** POST /logout — clear the session cookies. */
export const logout = async (): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.post('/logout');
  });
};

/** GET /confirm-email/:token — confirm a user's email address. */
export const confirmEmail = async (token: string): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.get(`/confirm-email/${token}`);
  });
};

/** POST /resend-confirmation — resend the confirmation email. */
export const resendConfirmation = async (email: string): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.post('/resend-confirmation', { email });
  });
};

/** POST /create-child — create a tethered child account (parent only). */
export const createChild = async ({ name }: CreateChildDto): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => {
    return api.post('/create-child', { name });
  });
};

/** POST /switch-to-parent — switch a child session back to the parent. */
export const switchToParent = async (): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => {
    return api.post('/switch-to-parent');
  });
};

/** POST /login-child — log in as one of the parent's children (parent only). */
export const loginChild = async ({ childId }: LoginChildDto): Promise<ApiResult<User>> => {
  return await handleResponse<User>(async () => {
    return api.post('/login-child', { childId });
  });
};

/** PUT /change-password — change the current user's password. */
export const changePassword = async ({ oldPassword, newPassword }: ChangePasswordDto): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.put('/change-password', { oldPassword, newPassword });
  });
};

/** POST /forgot-password — request a password-reset email. */
export const forgotPassword = async ({ email }: ForgotPasswordDto): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.post('/forgot-password', { email });
  });
};

/** PUT /reset-password/:resetToken — set a new password using a reset token. */
export const resetPassword = async ({
  newPassword,
  resetToken,
}: {
  newPassword?: string;
  resetToken: string;
}): Promise<ApiResult> => {
  return await handleResponse(async () => {
    return api.put(`/reset-password/${resetToken}`, { newPassword });
  });
};
