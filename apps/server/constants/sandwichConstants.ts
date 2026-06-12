/*
 * SERVER-ONLY sandwich list/feed defaults and the anonymous-author username.
 * Shared validation limits (MAX_NAME_LENGTH, MAX_COMMENT_LENGTH, MAX_COMMENT_LINES,
 * MAX_INGREDIENTS_COUNT) live in @sandwicheck/shared — import them from there directly.
 */
export const NO_USER_SANDWICH_USERNAME = 'people';

export const DEFAULT_SANDWICHES_PER_PAGE = 48;
/*
 * Hard upper bound on the page size for the public GET /sandwiches feed. Without it a caller
 * could pass ?limit=100000000 and force the server to load and serialize the entire collection.
 */
export const MAX_SANDWICHES_PER_PAGE = 100;
export const DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES = 30;
