/*
 * SERVER-ONLY user limits (not currently needed by the client). The shared user
 * vocabulary (ROLE, Role, MAX_USER_NAME_LENGTH) lives in @sandwicheck/shared —
 * import it from there directly.
 */
export const MAX_SANDWICHES_PER_DAY = 10;

export const MAX_TETHERED_CHILDREN = 10; // max children without email
