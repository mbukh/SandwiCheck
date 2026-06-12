import { SANDWICH_CACHE_TIME_OUT_DAYS } from '@/constants/sandwich-constants';

/*
 * The pending-auth autosave flag is only meaningful while the builder draft it was set for is
 * still cached. Beyond that the draft is gone, and resuming would auto-save whatever unrelated
 * sandwich the user happens to be building now — so the flag expires with the draft.
 */
export const PENDING_AUTOSAVE_TTL_MS = SANDWICH_CACHE_TIME_OUT_DAYS * 24 * 60 * 60 * 1000;

/** True when the pending-auth flag (a Date.now() timestamp) is recent enough to act on. */
export const isPendingAutosaveFresh = (timestamp: number | null, now: number): boolean => {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return false;
  }
  const age = now - timestamp;
  // Reject stale (older than the draft window) and future/garbled (negative age) timestamps.
  return age >= 0 && age <= PENDING_AUTOSAVE_TTL_MS;
};
