import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Client app ESLint configuration
 * Extends apps base config and adds React-specific rules and browser globals
 */
export default [
  ...appsBaseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { react: pluginReact },
    languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
    },
  },
];
