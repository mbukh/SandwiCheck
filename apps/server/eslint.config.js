import { defineConfig } from 'eslint/config';
import globals from 'globals';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Server app ESLint configuration
 * Extends apps base config, adds Node.js globals, and enables type-aware
 * linting for the server's TypeScript sources (a real tsconfig exists here).
 */
export default defineConfig([
  ...appsBaseConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Type-aware linting for the server TypeScript sources
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Catch un-awaited / mishandled promises (Mongoose & mailer are promise-heavy)
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // Remove assertions the compiler can already prove
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // Keep type-only exports explicit (requires type info)
      '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
      /*
       * Require explicit output (return) types so module boundaries are self-documenting
       * and inference drift can't silently widen a function's contract.
       * Inline callbacks and contextually-typed handlers (e.g. asyncHandler/RequestHandler)
       * stay exempt so we annotate real APIs, not throwaway expressions.
       */
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
  },

  // The ESLint flat config file itself is not part of the TS project
  {
    files: ['eslint.config.js'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
]);
