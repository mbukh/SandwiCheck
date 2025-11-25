import { defineConfig } from 'eslint/config';
import globals from 'globals';
import appsBaseConfig from '../../eslint.apps.base.js';

/**
 * Server app ESLint configuration
 * Extends apps base config and adds Node.js-specific globals
 */
export default defineConfig([
  ...appsBaseConfig,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
