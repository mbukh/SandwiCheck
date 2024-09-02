// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    singleQuote: false,
    trailingComma: "all",
    arrowParens: "always",
    semi: true,
    useTabs: false,
    tabWidth: 4,
    printWidth: 120,
    endOfLine: "auto",
};

export default config;
