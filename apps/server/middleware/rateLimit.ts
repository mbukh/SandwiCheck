import { rateLimit } from 'express-rate-limit';
import logger from '#utils/logger.ts';

/*
 * Factory for per-IP rate limiters on sensitive endpoints, stricter than the global
 * API limiter, to blunt credential-stuffing / signup & email-flooding / vote-spam
 * abuse. They depend on `trust proxy` being set (see server.ts) so the key is the
 * real client IP, not the upstream gateway. Limits are intentionally tolerant
 * because a whole household typically shares one public (NAT) IP. The default store
 * is in-memory (resets on restart) — acceptable for this single-instance deploy.
 */
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
}): ReturnType<typeof rateLimit> =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      // Log rate limit violation (PII will be automatically masked)
      logger.warn('Rate limit exceeded', {
        requestId: req.requestId,
        ip: req.ip || 'unknown',
        path: req.path,
      });

      res.status(429).json({
        success: false,
        error: { status: 429, message: options.message },
      });
    },
  });
