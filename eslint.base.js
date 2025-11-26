import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginImport from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';

/**
 * Base ESLint configuration for all files
 * Includes common rules, Unicorn plugin (flat/recommended), Prettier integration,
 * strict mode, and multiline comment style
 */
export default defineConfig([
  // Global Ignores (Replaces .eslintignore)
  {
    ignores: ['**/node_modules/', '**/dist/', '**/build/', '**/coverage/', '**/.pnp.*'],
  },

  // Apply recommended configs only to JS files
  { files: ['**/*.{js,mjs,cjs,jsx}'], ...pluginJs.configs.recommended },

  // Unicorn config (flat/recommended for flat config) - apply only to JS files
  { files: ['**/*.{js,mjs,cjs,jsx}'], ...eslintPluginUnicorn.configs.recommended },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: { strict: ['error', 'global'], 'multiline-comment-style': ['error', 'starred-block'] },
  },

  // Shared import-sorting + basic import hygiene config for the whole monorepo
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: pluginImport,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // ensure no competing sorters
      'sort-imports': 'off',
      'import/order': 'off',
    },
  },

  // eslint-config-prettier must be last to disable conflicting rules
  eslintConfigPrettier,
]);
