import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type { import("eslint").Linter.Config[] } */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { languageOptions: { globals: globals.browser } },
  { parserOptions: { ecmaVersion: 'ES2021' } },
  pluginJs.configs.recommended,
  pluginReact.configs.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
    },
  },
  eslintConfigPrettier,
];
