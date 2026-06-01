/*
 * SERVER-ONLY sandwich list/feed defaults and the anonymous-author username.
 * Shared validation limits (MAX_NAME_LENGTH, MAX_COMMENT_LENGTH, MAX_COMMENT_LINES,
 * MAX_INGREDIENTS_COUNT) live in @sandwicheck/shared — import them from there directly.
 */
export const NO_USER_SANDWICH_USERNAME = 'people';

export const DEFAULT_SANDWICHES_PER_PAGE = 48;
export const DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES = 30;
