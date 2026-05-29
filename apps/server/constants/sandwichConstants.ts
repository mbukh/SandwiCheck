/*
 * SHARED-READY: sandwich validation limits.
 * MAX_INGREDIENTS_COUNT, MAX_NAME_LENGTH, MAX_COMMENT_LENGTH and MAX_COMMENT_LINES
 * are duplicated on the client (apps/client/src/constants/sandwich-constants.js)
 * with identical values. Move these four to packages/shared so the builder UI and
 * the Mongoose validators stay in lockstep.
 */
export const MAX_INGREDIENTS_COUNT = 10;

export const MAX_NAME_LENGTH = 25;
export const MAX_COMMENT_LENGTH = 75;
export const MAX_COMMENT_LINES = 3;

// SERVER-ONLY: list/feed defaults and the anonymous-author username.
export const NO_USER_SANDWICH_USERNAME = 'people';

export const DEFAULT_SANDWICHES_PER_PAGE = 48;
export const DEFAULT_SANDWICH_UPDATE_WINDOW_MINUTES = 30;
