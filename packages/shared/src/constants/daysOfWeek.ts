/*
 * Canonical lowercase day values shared by client and server. The server keys
 * its weekMenu map by these; the client formats them for display (Title Case).
 */
export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
