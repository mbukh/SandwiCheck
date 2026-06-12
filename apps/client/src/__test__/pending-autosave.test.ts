import { isPendingAutosaveFresh, PENDING_AUTOSAVE_TTL_MS } from '@/utils/pending-autosave';

describe('isPendingAutosaveFresh', () => {
  const now = 1_700_000_000_000;

  it('treats a recent timestamp as fresh', () => {
    expect(isPendingAutosaveFresh(now - 60_000, now)).toBe(true);
    expect(isPendingAutosaveFresh(now, now)).toBe(true);
  });

  it('treats a timestamp older than the TTL as stale', () => {
    expect(isPendingAutosaveFresh(now - PENDING_AUTOSAVE_TTL_MS - 1, now)).toBe(false);
  });

  it('rejects missing or garbled values', () => {
    expect(isPendingAutosaveFresh(null, now)).toBe(false);
    expect(isPendingAutosaveFresh(Number.NaN, now)).toBe(false);
  });

  it('rejects a future timestamp', () => {
    expect(isPendingAutosaveFresh(now + 60_000, now)).toBe(false);
  });
});
