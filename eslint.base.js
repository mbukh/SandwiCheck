import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

/**
 * Base ESLint configuration for all files
 * Includes common rules, Unicorn plugin (flat/recommended), Prettier integration,
 * strict mode, and multiline comment style
 */
export default [
  // 1. Global Ignores (Replaces .eslintignore)
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/coverage/',
      '**/.tanstack/',
      '**/routeTree.gen.ts', // Ignore TanStack router generated files
      '**/.pnp.*',
    ],
  },
  // Apply recommended configs only to JS files
  { files: ['**/*.{js,mjs,cjs,jsx}'], ...pluginJs.configs.recommended },
  // Unicorn config (flat/recommended for flat config) - apply only to JS files
  { files: ['**/*.{js,mjs,cjs,jsx}'], ...eslintPluginUnicorn.configs.recommended },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: { strict: ['error', 'global'], 'multiline-comment-style': ['error', 'starred-block'] },
  },
  // eslint-config-prettier must be last to disable conflicting rules
  eslintConfigPrettier,
];
