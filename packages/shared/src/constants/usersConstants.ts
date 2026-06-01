/*
 * User domain value sets + derived types shared by client and server.
 *
 * Canonical reconciliation (server form wins): ROLE is an `as const` object with
 * the full role set { user, child, parent, admin }. The client signup UI only
 * offers the { child, parent } subset, but the canonical vocabulary lives here.
 */
export const ROLE = {
  user: 'user',
  child: 'child',
  parent: 'parent',
  admin: 'admin',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const MAX_USER_NAME_LENGTH = 25;
