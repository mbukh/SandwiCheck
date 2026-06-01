import { defineConfig } from 'eslint/config';
import packagesBaseConfig from '../../eslint.packages.base.js';

/**
 * ESLint config for the @sandwicheck/shared package.
 * Extends the environment-agnostic packages base and adds type-aware linting
 * for the TypeScript sources, mirroring the server's style decisions
 * (explicit output types on real APIs, consistent type-only exports).
 */
export default defineConfig([
  ...packagesBaseConfig,

  // Type-aware linting for the shared TypeScript sources
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
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
