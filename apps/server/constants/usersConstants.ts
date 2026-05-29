/*
 * SHARED-READY: ROLE + Role type and MAX_USER_NAME_LENGTH.
 * Both are already duplicated on the client
 * (apps/client/src/constants/user-constants.js) and are pure domain values.
 * Move to packages/shared as the single source of truth.
 * NOTE on divergence to reconcile when detaching:
 *   - The client's ROLE is a plain array ['child', 'parent']; the server uses an
 *     `as const` object { user, child, parent, admin }. Adopt the object form
 *     (with the full role set) as canonical before sharing.
 */
export const ROLE = {
  user: 'user',
  child: 'child',
  parent: 'parent',
  admin: 'admin',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

// SERVER-ONLY: server-side limits (not currently needed by the client).
export const MAX_SANDWICHES_PER_DAY = 10;

export const MAX_TETHERED_CHILDREN = 10; // max children without email

// SHARED-READY: also enforced in client signup UI (same value).
export const MAX_USER_NAME_LENGTH = 25;
