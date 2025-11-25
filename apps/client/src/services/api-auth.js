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
 *
 * UI IMPLEMENTATION STATUS: 63.6% (7/11 endpoints)
 * ✅ IMPLEMENTED (7):
 *   - signup: Signup.jsx, SignupModal.jsx - Full registration form with role selection
 *   - login: Login.jsx, LoginModal.jsx - Login form with email/password
 *   - logout: useUser hook, Header.jsx - Logout button in navigation
 *   - confirmEmail: confirm-email.$token.tsx - Full email confirmation page with error handling
 *   - resendConfirmation: Login.jsx - Resend button with cooldown timer
 *   - forgotPassword: ForgotPassword.jsx, ForgotPasswordModal.jsx - Password reset request form
 *   - resetPassword: ResetPassword.jsx - Password reset form with token
 * ❌ NOT IMPLEMENTED (4):
 *   - createChild: API exists, Family.jsx has link to signup with parentId but no direct createChild form
 *   - loginChild: API exists, no UI button/action in Family page to login as child
 *   - switchToParent: API exists, no UI button for child to switch back to parent account
 *   - changePassword: API exists, no user settings/profile page for password management
 */

/**
 * User registration endpoint
 * POST /signup
 * Access: Public
 * Status: ✅ UI_IMPLEMENTED - Used in Signup.jsx, SignupModal.jsx
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
 * Status: ✅ UI_IMPLEMENTED - Used in Login.jsx, LoginModal.jsx
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
 * Get active authenticated session details
 * GET /session
 * Access: Private
 * Status: ✅ UI_IMPLEMENTED - Used in AuthGlobalContext for session hydration
 * @returns {Promise<Object>} { success: boolean, data: { activeUser, parentUser, actingAsChild } }
 */
export const getSession = async () => {
  return await handleResponse(async () => {
    return api.get('/session');
  });
};

/**
 * User logout endpoint
 * POST /logout
 * Access: Private
 * Status: ✅ UI_IMPLEMENTED - Used in useUser hook (logOut function)
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
 * Status: ✅ UI_IMPLEMENTED - Used in confirm-email.$token.tsx
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
 * Status: ✅ UI_IMPLEMENTED - Used in Login.jsx (handleResendConfirmation)
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
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no UI form. Family.jsx has link but no implementation.
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
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no UI button/action
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
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no UI button/action in Family page
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
 * Status: ❌ UI_NOT_IMPLEMENTED - API exists but no user settings/profile page
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
 * Status: ✅ UI_IMPLEMENTED - Used in ForgotPassword.jsx, ForgotPasswordModal.jsx
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
 * Status: ✅ UI_IMPLEMENTED - Used in ResetPassword.jsx
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
