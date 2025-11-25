import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Client app ESLint configuration
 * Extends apps base config and adds React-specific rules and browser globals
 */
export default defineConfig([
  ...appsBaseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { react: pluginReact },
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
    },
  },
]);
