// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs
import baseConfig from '../../prettier.config.js';

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = { ...baseConfig, plugins: [...baseConfig.plugins, 'prettier-plugin-tailwindcss'] };

export default config;
