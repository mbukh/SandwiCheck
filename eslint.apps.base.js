import { defineConfig } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';
import baseConfig from './eslint.base.js';

/**
 * Shared ESLint configuration for apps/
 * Extends base config with common app-level settings; each app adds its own environment (browser / node).
 */
export default defineConfig([
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: { parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/no-dynamic-require': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/no-dynamic-require': 'error',
      'no-console': 'error',
    },
  },
]);
