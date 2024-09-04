import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type { import("eslint").Linter.Config[] } */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'], ignores: ['client/**/*.*'] },
  { languageOptions: { globals: [globals.browser, globals.node], parserOptions: { ecmaVersion: 'ES2021' } } },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];
