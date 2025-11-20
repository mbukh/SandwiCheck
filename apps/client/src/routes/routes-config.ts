/**
 * Centralized route exports
 *
 * This file re-exports all route objects and provides route path constants
 * derived from the generated route tree for type-safe navigation.
 *
 * Route paths are inherited from TanStack Router's generated route tree
 * to ensure consistency and maintainability.
 */

// Route objects - these are used by TanStack Router's route tree generator
// Note: IndexRoute is exported directly from ./index.tsx to avoid circular dependency
export { RootRoute } from './__root';
export { NotFoundRoute } from './$';
export { BestRoute } from './best';
export { CartRoute } from './cart';
export { CreateRoute } from './create';
export { FamilyRoute } from './family';
export { LoginRoute } from './login';
export { SignupRoute } from './signup';
export { ConfirmEmailRoute } from './confirm-email.$token';
export { ForgotPasswordRoute } from './forgot-password';
export { ResetPasswordRoute } from './reset-password.$token';
export { MenuRoute } from './menu';
export { LatestRoute } from './latest';
export { SandwichRoute } from './sandwich.$sandwichId';
export { FamilyChildRoute } from './family.$childId';
export { LoginParentRoute } from './login.parent.$parentId';
export { SignupParentRoute } from './signup.parent.$parentId';

// Route path constants derived from route IDs
// These match the route IDs from routeTree.gen.ts to ensure consistency
// Using route IDs ensures paths stay in sync with the generated route tree
export const ROUTE_PATHS = {
  ROOT: '/',
  INDEX: '/',
  NOT_FOUND: '/$',
  BEST: '/best',
  CART: '/cart',
  CREATE: '/create',
  FAMILY: '/family',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CONFIRM_EMAIL: '/confirm-email/$token',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/$token',
  MENU: '/menu',
  LATEST: '/latest',
  SANDWICH: '/sandwich/$sandwichId',
  FAMILY_CHILD: '/family/$childId',
  LOGIN_PARENT: '/login/parent/$parentId',
  SIGNUP_PARENT: '/signup/parent/$parentId',
} as const;

// Type for route path values (for better type safety in JS projects)
export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
