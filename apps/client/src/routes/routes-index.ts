/**
 * Routes index - re-exports all routes and route paths
 *
 * This file re-exports everything from routes-config.ts to maintain
 * clean import paths (from '../routes' instead of '../routes/routes-config')
 *
 * Note: IndexRoute is available directly from './index.tsx' if needed,
 * but is not re-exported here to avoid circular dependency issues.
 */

export * from './routes-config';
