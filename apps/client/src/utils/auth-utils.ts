/**
 * Auth Route Utilities
 *
 * Provides utility functions for handling authentication-related routes.
 */

/** Checks if a pathname is an auth route (e.g. '/login', '/reset-password/abc123'). */
export const isAuthRoute = (pathname: string): boolean => {
  // Exact matches for auth routes
  const exactAuthRoutes = ['/login', '/signup', '/forgot-password'];
  if (exactAuthRoutes.includes(pathname)) {
    return true;
  }

  // Pattern matches for auth routes with parameters
  const authRoutePatterns = [
    /^\/reset-password\/[^/]+$/, // /reset-password/*
    /^\/confirm-email\/[^/]+$/, // /confirm-email/*
    /^\/login\/parent\/[^/]+$/, // /login/parent/*
    /^\/signup\/parent\/[^/]+$/, // /signup/parent/*
  ];

  return authRoutePatterns.some((pattern) => pattern.test(pathname));
};

/**
 * Whether a `returnTo` value is a safe post-login redirect target: a non-empty same-origin path
 * that is not an auth route. Rejects absolute and protocol-relative URLs (`//evil.com`,
 * `https://…`) so a crafted `?returnTo=` can't bounce the user off-site after authenticating.
 */
export const isSafeReturnTo = (returnTo: string | null | undefined): returnTo is string => {
  if (!returnTo || !returnTo.trim()) {
    return false;
  }
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return false;
  }
  return !isAuthRoute(returnTo);
};
