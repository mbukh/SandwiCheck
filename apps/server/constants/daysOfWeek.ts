/*
 * SHARED-READY: DAYS_OF_WEEK + DayOfWeek.
 * The client keeps its own copy (apps/client/src/constants/daysOfWeek.js).
 * Move to packages/shared as the single source of truth.
 * NOTE on divergence to reconcile when detaching:
 *   - The client uses Title Case for display ('Sunday', ...); the server uses
 *     lowercase keys for the weekMenu map. Share the lowercase canonical values
 *     and format for display on the client.
 */
export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
