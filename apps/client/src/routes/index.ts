/**
 * This file serves dual purposes:
 * 1. Exports Route for TanStack Router's route tree generator (from index.tsx)
 * 2. Re-exports ROUTE_PATHS and other route objects for application use (from routes-index.ts)
 */

// Export Route for route tree generator
export { Route, IndexRoute } from './index.tsx';
// Re-export everything else (ROUTE_PATHS, other routes) for application use
export * from './routes-index';
