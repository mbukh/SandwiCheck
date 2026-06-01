import { defineConfig } from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Client app ESLint configuration
 * Extends apps base config, adds React-specific rules + browser globals, and
 * enables type-aware linting for the client's TypeScript sources (mirroring the
 * server's style decisions: explicit output types, consistent type-only exports).
 */
export default defineConfig([
  // Ignore generated TanStack Router output
  { ignores: ['**/routeTree.gen.ts'] },

  ...appsBaseConfig,
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { react: pluginReact },
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'import/no-nodejs-modules': 'error',

      /*
       * React Compiler correctness rules are ENFORCED. react-hooks/purity, immutability,
       * static-components, and set-state-in-effect all stay at 'error'. The two components that
       * legitimately drive state from an effect — the timer-based animation in useLayerTransition
       * and the one-shot sessionStorage read in Family's RestoredFromChildNote — use a scoped,
       * justified eslint-disable rather than relaxing the rule globally.
       */
      'react-hooks/set-state-in-effect': 'error',

      /*
       * react-refresh/only-export-components stays off: our Context modules
       * deliberately co-export a Provider component and its hook from one file,
       * which this Fast-Refresh ergonomics hint flags. It is a DX nicety, not a
       * correctness rule.
       */
      'react-refresh/only-export-components': 'off',
    },
  },

  // Type-aware linting for the client TypeScript sources
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Remove assertions the compiler can already prove
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // Keep type-only exports explicit (requires type info)
      '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
      /*
       * Require explicit output (return) types so module boundaries are self-documenting
       * and inference drift can't silently widen a function's contract.
       * Inline callbacks and contextually-typed handlers (event handlers, render props)
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

  {
    files: ['**/src/__test__/**', '**/src/__test__/**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        vi: 'readonly',
      },
    },
    rules: {
      // Testing-library export shape sometimes confuses `import/named`
      'import/named': 'off',
    },
  },
]);
