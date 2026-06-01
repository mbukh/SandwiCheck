import { defineConfig } from 'eslint/config';
import appsBaseConfig from './eslint.apps.base.js';

/**
 * ESLint config for shared packages (used by both client & server)
 * - No Node.js or browser globals
 * - No Node.js built-in modules
 * - No app/framework-specific imports (React, Express, etc.)
 * - Meant only for pure/top-level functions & constants
 */
export default defineConfig([
  ...appsBaseConfig,

  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],

    // IMPORTANT: keep this package "environment-agnostic"
    languageOptions: {
      /*
       * don't add `env: node` or `env: browser` anywhere here:
       * we want only standard ECMAScript built-ins.
       */
      globals: {}, // explicitly empty, merged on top of base config
    },

    rules: {
      /**
       * Forbid host-specific globals (even if TS/lib pulls them in)
       * If you ever add TS here, this stops DOM or Node globals sneaking in.
       */
      'no-restricted-globals': [
        'error',
        // Browser-ish globals
        'window',
        'document',
        'navigator',
        'location',
        'localStorage',
        'sessionStorage',
        'fetch',
        'Request',
        'Response',
        'XMLHttpRequest',
        // Node-ish globals
        'process',
        'Buffer',
        '__dirname',
        '__filename',
        'require',
        'module',
        'global',
      ],

      /**
       * Don’t allow Node built-in modules in shared code
       * (fs, path, crypto, etc.)
       */
      'import/no-nodejs-modules': 'error',

      /**
       * Keep shared utils independent of app/framework layers.
       * You can expand this list whenever you add new app-only deps.
       */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            // UI-only
            'react',
            'react-dom',
            '@tanstack/react-router',
            // Server-only
            'express',
            'mongoose',
            'nodemailer',
          ],
          patterns: [
            // node:fs, node:path, etc.
            'node:*',
            // client and server packages
            '@sandwicheck/client*',
            '@sandwicheck/server*',
          ],
        },
      ],
    },
  },
]);
