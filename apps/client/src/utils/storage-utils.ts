/**
 * Reads and JSON-parses a localStorage value.
 *
 * Returns null when the key is absent, when storage is unavailable (SSR/tests),
 * or when the stored value is not valid JSON. A corrupt value is removed so it
 * can't wedge the app on every subsequent read — a single malformed key used to
 * throw out of an uncaught `JSON.parse` and brick hydration.
 */
export function readJsonFromStorage<T>(key: string): T | null {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
    return null;
  }

  const raw = globalThis.localStorage.getItem(key);
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Non-JSON / corrupt value — drop it so we stop tripping over it.
    globalThis.localStorage.removeItem(key);
    return null;
  }
}
