/*
 * CLIENT-ONLY user constants. MAX_USER_NAME_LENGTH and the ROLE vocabulary live
 * in @sandwicheck/shared — import them from there directly. The signup UI only
 * offers the { child, parent } subset of the canonical ROLE vocabulary.
 */
import { ROLE } from '@sandwicheck/shared';

export const LOGGED_IN_USER_TIME_OUT_DAYS = 90;

/** Roles selectable in the signup form. */
export const SIGNUP_ROLES = [ROLE.child, ROLE.parent] as const;
