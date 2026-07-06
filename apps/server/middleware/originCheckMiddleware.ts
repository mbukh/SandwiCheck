import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import logger from '#utils/logger.ts';

/*
 * CSRF defense-in-depth: reject state-changing requests from foreign web origins.
 *
 * The auth cookie is sameSite=strict, which already keeps it off cross-site
 * requests — but that leaves two gaps this check closes:
 *  - Login CSRF: a cross-site form POST to /auth/login with the attacker's
 *    credentials needs no existing cookie; the response SETS one, silently
 *    logging the victim's browser into the attacker's account.
 *  - Single point of failure: if the cookie is ever relaxed to sameSite=lax,
 *    nothing else stands between a forged form POST and the session.
 *
 * Fail-open rules (why each is safe):
 *  - No Origin header → allow. Only browsers attach Origin, and only browsers
 *    are CSRF-confused deputies. Native mobile apps, curl, and server-to-server
 *    clients send no Origin and must keep working.
 *  - Sec-Fetch-Site: same-origin → allow. It is a forbidden header (scripts
 *    cannot set it), so a browser-attested same-origin request is trustworthy
 *    even if CLIENT_URL is misconfigured — a bare CLIENT_URL equality check
 *    would take the whole same-origin SPA down on an env mistake.
 *  - Otherwise the origin must pass the same allowlist CORS uses.
 *
 * NOTE for a future WebView-hybrid mobile app (Capacitor/Ionic): those send
 * Origin values like capacitor://localhost and are rejected here — but they are
 * equally rejected by the credentialed CORS allowlist, so supporting one means
 * extending isAllowedOrigin, not bypassing this check.
 */

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Single source of truth for the browser-origin allowlist; also drives cors() in server.ts.
export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) {
    return true;
  }
  if (process.env.CLIENT_URL === origin) {
    return true;
  }
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return process.env.NODE_ENV === 'local' && isLocalhost;
};

export const originCheck: RequestHandler = (req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  if (req.get('sec-fetch-site') === 'same-origin') {
    return next();
  }

  const origin = req.get('origin');
  if (isAllowedOrigin(origin)) {
    return next();
  }

  logger.warn('Blocked cross-origin state-changing request', {
    origin,
    method: req.method,
    path: req.path,
  });
  return next(createHttpError.Forbidden('Cross-origin request blocked'));
};
