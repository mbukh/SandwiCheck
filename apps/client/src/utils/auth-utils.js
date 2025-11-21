/**
 * Auth Route Utilities
 *
 * Provides utility functions for handling authentication-related routes.
 */

/**
 * Checks if a pathname is an auth route
 * @param {string} pathname - The pathname to check (e.g., '/login', '/reset-password/abc123')
 * @returns {boolean} True if the pathname is an auth route
 */
export const isAuthRoute = (pathname) => {
  // Exact matches for auth routes
  const exactAuthRoutes = ['/login', '/signup', '/forgot-password'];
  if (exactAuthRoutes.includes(pathname)) {
    return true;
  }

  // Pattern matches for auth routes with parameters
  const authRoutePatterns = [
    /^\/reset-password\/[^/]+$/,  // /reset-password/*
    /^\/confirm-email\/[^/]+$/,   // /confirm-email/*
    /^\/login\/parent\/[^/]+$/,   // /login/parent/*
    /^\/signup\/parent\/[^/]+$/   // /signup/parent/*
  ];

  return authRoutePatterns.some(pattern => pattern.test(pathname));
};

export default { isAuthRoute };
