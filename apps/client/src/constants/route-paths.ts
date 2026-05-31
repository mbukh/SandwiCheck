/**
 * Route path constants derived from the generated TanStack Router route tree,
 * for type-safe navigation. Values match the route IDs in routeTree.gen.ts.
 */
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
