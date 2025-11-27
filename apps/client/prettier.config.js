// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs
import baseConfig from '../../prettier.config.js';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
const config = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), import('prettier-plugin-tailwindcss')],
  tailwindStylesheet: './src/styles/styles.css',
};

export default config;
