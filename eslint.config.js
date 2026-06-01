import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import pluginYml from 'eslint-plugin-yml';
import baseConfig from './eslint.base.js';

/**
 * Root-level ESLint configuration
 * Applies to files in root directory (excluding apps/, scripts/, JSON/YAML/MD)
 * Includes separate configs for Markdown, JSON, and YAML files at root level
 */
export default defineConfig([
  // Ignore patterns for root config
  { ignores: ['apps/**', 'scripts/**'] },
  // Base configuration for JS/JSX files at root level only
  ...baseConfig.map((config) => {
    if (config.files) {
      return { ...config, files: ['*.js', '*.mjs', '*.cjs', '*.jsx'] };
    }
    return config;
  }),
  // Markdown files at root level
  { files: ['*.md'], plugins: { markdown }, language: 'markdown/gfm', processor: 'markdown/markdown' },
  // JSON files at root level
  {
    files: ['*.json'],
    ignores: ['package-lock.json'],
    plugins: { json },
    language: 'json/json',
    rules: { strict: 'off' },
  },
  // YAML files at root level - spread recommended config if available, then override
  ...(pluginYml.configs?.['flat/recommended'] || []),
  { files: ['*.yaml', '*.yml'], plugins: { yml: pluginYml }, rules: { strict: 'off' } },
]);
