import { createFetchApi } from '../utils/fetch-api';

import { handleResponse } from '../utils/api-utils';

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

/**
 * User registration endpoint
 * POST /signup
 * Access: Public
 * @param {Object} params - Registration parameters
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @param {string} params.name - User name
 * @param {string} params.role - User role (user/parent)
 * @param {string} [params.parentId] - Parent ID for child registration
 * @returns {Promise<Object>} { success: boolean, data: { user, token } }
 */
export const signup = async ({ email, password, name, role, parentId }) => {
  return await handleResponse(async () => {
    return api.post('/signup', { email, password, name, role, parentId });
  });
};

/**
 * User login endpoint
 * POST /login
 * Access: Public
 * @param {Object} params - Login parameters
 * @param {string} params.email - User email
 * @param {string} params.password - User password
 * @param {string} [params.parentId] - Parent ID for child login
 * @returns {Promise<Object>} { success: boolean, data: { user, token } }
 */
export const login = async ({ email, password, parentId }) => {
  return await handleResponse(async () => {
    return api.post('/login', { email, password, parentId });
  });
};

/**
 * User logout endpoint
 * POST /logout
 * Access: Private
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const logout = async () => {
  return await handleResponse(async () => {
    return api.post('/logout');
  });
};

/**
 * Email confirmation endpoint
 * GET /confirm-email/:token
 * Access: Public
 * @param {string} token - Email confirmation token
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const confirmEmail = async (token) => {
  return await handleResponse(async () => {
    return api.get(`/confirm-email/${token}`);
  });
};

/**
 * Resend confirmation email endpoint
 * POST /resend-confirmation
 * Access: Public
 * @param {string} email - User email
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const resendConfirmation = async (email) => {
  return await handleResponse(async () => {
    return api.post('/resend-confirmation', { email });
  });
};

/**
 * Create child user endpoint (parent only)
 * POST /create-child
 * Access: Private/Parent
 * @param {Object} params - Child creation parameters
 * @param {string} params.name - Child name
 * @returns {Promise<Object>} { success: boolean, data: { child, tempPassword } }
 */
export const createChild = async ({ name }) => {
  return await handleResponse(async () => {
    return api.post('/create-child', { name });
  });
};

/**
 * Switch from child to parent account
 * POST /switch-to-parent
 * Access: Private/Child
 * @returns {Promise<Object>} { success: boolean, data: { user, token } }
 */
export const switchToParent = async () => {
  return await handleResponse(async () => {
    return api.post('/switch-to-parent');
  });
};

/**
 * Login as child user (parent only)
 * POST /login-child
 * Access: Private/Parent
 * @param {Object} params - Child login parameters
 * @param {string} params.childId - Child user ID
 * @returns {Promise<Object>} { success: boolean, data: { user, token } }
 */
export const loginChild = async ({ childId }) => {
  return await handleResponse(async () => {
    return api.post('/login-child', { childId });
  });
};

/**
 * Change user password
 * PUT /change-password
 * Access: Private
 * @param {Object} params - Password change parameters
 * @param {string} params.oldPassword - Current password
 * @param {string} params.newPassword - New password
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const changePassword = async ({ oldPassword, newPassword }) => {
  return await handleResponse(async () => {
    return api.put('/change-password', { oldPassword, newPassword });
  });
};

/**
 * Request password reset
 * POST /forgot-password
 * Access: Public
 * @param {string} email - User email
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const forgotPassword = async ({ email }) => {
  return await handleResponse(async () => {
    return api.post('/forgot-password', { email });
  });
};

/**
 * Reset password with token
 * PUT /reset-password/:resetToken
 * Access: Public
 * @param {Object} params - Password reset parameters
 * @param {string} params.newPassword - New password
 * @param {string} params.resetToken - Password reset token
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const resetPassword = async ({ newPassword, resetToken }) => {
  return await handleResponse(async () => {
    return api.put(`/reset-password/${resetToken}`, { newPassword });
  });
};
