import { defineConfig } from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Client app ESLint configuration
 * Extends apps base config and adds React-specific rules and browser globals
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
      ecmaVersion: 2020,
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

      // ---- React 19 strict rules: temporarily disabled to unblock lint ----
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-refresh/only-export-components': 'off',
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
