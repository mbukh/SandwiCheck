import pluginJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint configuration for all files
 * Includes common rules, Unicorn plugin (flat/recommended), Prettier integration,
 * strict mode, and multiline comment style
 */
export default defineConfig([
  // Global Ignores (Replaces .eslintignore)
  {
    ignores: ['**/node_modules/', '**/dist/', '**/build/', '**/coverage/', '**/.pnp.*'],
  },

  // Base JS/TS: ESLint recommended + eslint-plugin-import recommended rules
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    ...pluginJs.configs.recommended,
    plugins: {
      import: importPlugin,
    },
    rules: {
      // keep ESLint core recommended rules
      ...pluginJs.configs.recommended.rules,
      // add eslint-plugin-import's recommended rules (rules only, no legacy plugins array)
      ...importPlugin.configs.recommended.rules,
    },
  },

  // TypeScript: typescript-eslint recommended + import/typescript rules
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    // only pull in the rules part of the legacy TS config
    rules: {
      ...importPlugin.configs.typescript.rules,
      // Auto-add the `type` keyword to type-only imports (inline form, compatible with verbatimModuleSyntax)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Ensure type-only imports never trigger a runtime side effect
      '@typescript-eslint/no-import-type-side-effects': 'error',
      /*
       * No-enum convention (intentional, enforced):
       * This codebase models enumerations as `as const` objects plus a derived
       * union type — e.g. `export const ROLE = { ... } as const;
       * export type Role = (typeof ROLE)[keyof typeof ROLE];`. That keeps values
       * as plain, tree-shakeable, JSON-serializable strings (no reverse-mapping or
       * runtime object emit like TS `enum`), and the literal values transfer
       * cleanly to the client and to packages/shared once detached.
       * Decisively: `enum` is NON-ERASABLE syntax. It is already rejected by tsconfig
       * `erasableSyntaxOnly`, and Node's default type-stripping (strip-only, how this
       * server runs `.ts`) would refuse to execute it without `--experimental-transform-types`.
       * `const enum` is unsafe on top of that under isolatedModules. So `enum` is
       * banned by design; use the `as const` + union pattern instead. (This rule is
       * intentionally redundant with `erasableSyntaxOnly` for a clearer message and to
       * cover any package that doesn't set that compiler flag.)
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'Do not use `enum`. Use an `as const` object plus a derived union type instead (e.g. `const ROLE = {...} as const; type Role = (typeof ROLE)[keyof typeof ROLE]`).',
        },
      ],
    },
  },

  // Unicorn preset (this plugin already targets flat config)
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    extends: [eslintPluginUnicorn.configs.recommended],
  },

  // Extra base rules / overrides
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    rules: {
      strict: ['error', 'global'],
      'multiline-comment-style': ['error', 'starred-block'],
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
            camelCase: true,
          },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-sort': 'off',
    },
  },

  // Shared import-sorting + basic import hygiene config for the whole monorepo
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Styles last (.css, .scss, .sass, .less, .styl, etc.)
            [String.raw`^.+\.?(css|scss|sass|less|styl)($|\b)`],

            /*
             * Side-effect imports (effects)
             * e.g. import './setup';, import 'reflect-metadata';
             */
            [String.raw`^\u0000`],

            // Node builtins (node: + classic core modules)
            [
              '^node:',
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|perf_hooks|process|punycode|querystring|readline|repl|stream|string_decoder|timers|tls|tty|url|util|v8|vm|zlib)(/.*|$)',
            ],

            // React (keep React-related imports together & near the top)
            ['^react$', '^react-dom$', '^react-'],

            // TanStack
            ['^@tanstack/'],

            // Express
            ['^express$', '^express-'],

            /*
             * Other external packages
             * e.g. lodash, axios, @storybook/*
             */
            [String.raw`^@?\w`],

            /*
             * Internal aliases (tune these to your monorepo)
             * e.g. @/* (client src), @app/*, @server/*, @shared/*, etc.
             */
            ['^@/', '^#', '^(@app|@server|@shared|@components|@lib)(/.*|$)'],

            // Parent imports
            [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],

            // Sibling + index imports
            [
              String.raw`^\./(?!/?(!\b(css|scss|sass|less|styl)\b)$)`,
              String.raw`^\./?(!\b(css|scss|sass|less|styl)\b)$`,
            ],
          ].reduce((acc, item) => [[...acc[0], ...item]], [[]]), // remove newline between groups
        },
      ],

      'simple-import-sort/exports': 'error',

      // Basic import hygiene from eslint-plugin-import
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Disable other sorters to avoid conflicts
      'sort-imports': 'off',
      'import/order': 'off',
    },
  },

  // ESLint config files: plugin-import can't resolve 'eslint/config' or 'typescript-eslint'
  {
    files: ['**/eslint.*.{js,cjs,mjs}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },

  /*
   * Shared import resolver + modules that ESLint can't statically resolve.
   * The TypeScript resolver understands workspace packages, `exports` maps and
   * `.ts` sources (e.g. @sandwicheck/shared); the node resolver is kept as a
   * fallback for plain JS configs.
   */
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      // Treat these as "core" modules so import/no-unresolved doesn't complain
      'import/core-modules': [
        '@rolldown/plugin-babel',
        '@tailwindcss/vite',
        '@tanstack/router-plugin/vite',
        '@vitejs/plugin-react',
        'swiper/css',
        'swiper/css/a11y',
        'swiper/react',
        'vite',
      ],
    },
  },

  // eslint-config-prettier must be last to disable conflicting rules
  eslintConfigPrettier,
]);
