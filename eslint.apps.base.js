import { defineConfig } from 'eslint/config';
import baseConfig from './eslint.base.js';

/**
 * Shared ESLint configuration for apps/
 * Extends base config with common app-level settings; each app adds its own environment (browser / node).
 */
export default defineConfig([
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: { parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
