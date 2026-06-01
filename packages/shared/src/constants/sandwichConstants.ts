/*
 * Sandwich validation limits shared by the client builder UI and the server
 * Mongoose validators. Server-only feed defaults and the anonymous-author
 * username intentionally stay in apps/server/constants.
 */
export const MAX_INGREDIENTS_COUNT = 10;

export const MAX_NAME_LENGTH = 25;
export const MAX_COMMENT_LENGTH = 75;
export const MAX_COMMENT_LINES = 3;
