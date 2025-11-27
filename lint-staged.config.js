/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  // Format files that Prettier can handle (JSON, YAML, Markdown, etc.)
  '!(*.{js,mjs,cjs,jsx,ts,tsx})': (stagedFiles) => [`prettier --write --ignore-unknown ${stagedFiles.join(' ')}`],
  '*.{js,mjs,cjs,jsx,ts,tsx}': (stagedFiles) => [`eslint --fix`, `prettier --write ${stagedFiles.join(' ')}`],
  // '**/*.ts?(x)': () => 'tsc --noEmit',
};
