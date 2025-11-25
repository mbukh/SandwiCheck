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
export { Route as RootRoute } from './__root.jsx';
export { Route as BestRoute } from './best.tsx';
export { Route as CartRoute } from './cart.tsx';
export { Route as ConfirmEmailRoute } from './confirm-email.$token.tsx';
export { Route as CreateRoute } from './create.tsx';
export { Route as FamilyRoute } from './family.tsx';
export { Route as FamilyChildRoute } from './family.$childId.tsx';
export { Route as ForgotPasswordRoute } from './forgot-password.tsx';
export { Route, Route as IndexRoute } from './index.tsx';
export { Route as LatestRoute } from './latest.tsx';
export { Route as LoginRoute } from './login.tsx';
export { Route as LoginParentRoute } from './login.parent.$parentId.tsx';
export { Route as MenuRoute } from './menu.tsx';
export { Route as ResetPasswordRoute } from './reset-password.$token.tsx';
export { Route as SandwichRoute } from './sandwich.$sandwichId.tsx';
export { Route as SignupRoute } from './signup.tsx';
export { Route as SignupParentRoute } from './signup.parent.$parentId.tsx';

// Route path constants derived from route IDs
// These match the route IDs from routeTree.gen.ts to ensure consistency
// Using route IDs ensures paths stay in sync with the generated route tree
export const ROUTE_PATHS = {
  INDEX: '/',
  ROOT: '/',
  BEST: '/best',
  CART: '/cart',
  CONFIRM_EMAIL: '/confirm-email/$token',
  CREATE: '/create',
  FAMILY: '/family',
  FAMILY_CHILD: '/family/$childId',
  FORGOT_PASSWORD: '/forgot-password',
  LATEST: '/latest',
  LOGIN: '/login',
  LOGIN_PARENT: '/login/parent/$parentId',
  MENU: '/menu',
  RESET_PASSWORD: '/reset-password/$token',
  SANDWICH: '/sandwich/$sandwichId',
  SIGNUP: '/signup',
  SIGNUP_PARENT: '/signup/parent/$parentId',
} as const;

// Type for route path values (for better type safety in JS projects)
export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
