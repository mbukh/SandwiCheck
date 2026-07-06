import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAllowedOrigin, originCheck } from '../originCheckMiddleware.ts';

// vi.mock is hoisted above the import above, so originCheck picks up the stubbed logger.
vi.mock('#utils/logger.ts', () => ({ default: { warn: vi.fn() } }));

/** Invoke originCheck with a mock req and return the spied next(). */
const invoke = (method: string, headers: Record<string, string> = {}): ReturnType<typeof vi.fn> => {
  const req = {
    method,
    path: '/v1/sandwiches',
    get: (name: string) => headers[name.toLowerCase()],
  } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn();
  originCheck(req, res, next);
  return next;
};

const wasAllowed = (next: ReturnType<typeof vi.fn>): boolean =>
  next.mock.calls.length === 1 && next.mock.calls[0]?.[0] === undefined;

const blockedStatus = (next: ReturnType<typeof vi.fn>): number | undefined => next.mock.calls[0]?.[0]?.status;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isAllowedOrigin', () => {
  it('allows requests without an Origin header (mobile apps, curl, server-to-server)', () => {
    const noOrigin = undefined;
    expect(isAllowedOrigin(noOrigin)).toBe(true);
  });

  it('allows the configured CLIENT_URL origin', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(isAllowedOrigin('https://sandwicheck.app')).toBe(true);
  });

  it('rejects a foreign origin', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
  });

  it('rejects the literal "null" origin (sandboxed iframes, redirects)', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(isAllowedOrigin('null')).toBe(false);
  });

  it('allows localhost origins only when NODE_ENV is local', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    vi.stubEnv('NODE_ENV', 'local');
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:5173')).toBe(true);

    vi.stubEnv('NODE_ENV', 'production');
    expect(isAllowedOrigin('http://localhost:5173')).toBe(false);
  });

  it('does not treat localhost-prefixed attacker domains as localhost', () => {
    vi.stubEnv('NODE_ENV', 'local');
    expect(isAllowedOrigin('http://localhost.evil.example')).toBe(false);
  });
});

describe('originCheck middleware', () => {
  it('ignores GET requests regardless of origin', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(wasAllowed(invoke('GET', { origin: 'https://evil.example' }))).toBe(true);
  });

  it('ignores OPTIONS preflights', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(wasAllowed(invoke('OPTIONS', { origin: 'https://evil.example' }))).toBe(true);
  });

  it('allows a POST without an Origin header (native mobile app / curl)', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(wasAllowed(invoke('POST'))).toBe(true);
  });

  it('allows a POST from the configured client origin', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    expect(wasAllowed(invoke('POST', { origin: 'https://sandwicheck.app' }))).toBe(true);
  });

  it('allows a browser-attested same-origin POST even when CLIENT_URL is misconfigured', () => {
    vi.stubEnv('CLIENT_URL', 'https://wrong.example');
    const next = invoke('POST', {
      origin: 'https://sandwicheck.app',
      'sec-fetch-site': 'same-origin',
    });
    expect(wasAllowed(next)).toBe(true);
  });

  it('blocks a cross-site POST with 403 (login CSRF / forged form post)', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    const next = invoke('POST', { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' });
    expect(wasAllowed(next)).toBe(false);
    expect(blockedStatus(next)).toBe(403);
  });

  it('blocks cross-site PUT, PATCH, and DELETE too', () => {
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      expect(blockedStatus(invoke(method, { origin: 'https://evil.example' }))).toBe(403);
    }
  });

  it('does not let a forgeable Sec-Fetch-Site value from a cross-site page bypass the check', () => {
    /*
     * Browsers own Sec-Fetch-Site (forbidden header) and never send 'same-origin'
     * for a cross-site request; only non-browser clients can spoof it, and those
     * carry no ambient cookie, so nothing is gained. Values a real cross-site
     * request can carry must still be blocked.
     */
    vi.stubEnv('CLIENT_URL', 'https://sandwicheck.app');
    for (const secFetchSite of ['cross-site', 'same-site', 'none']) {
      const next = invoke('POST', { origin: 'https://evil.example', 'sec-fetch-site': secFetchSite });
      expect(blockedStatus(next)).toBe(403);
    }
  });
});
