import * as crypto from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export const generatePasswordToken = (payload: string | Buffer | object): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as SignOptions['expiresIn'],
  });
};

export const generateResetPasswordToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};

/*
 * Hash a high-entropy random token (reset-password / email-confirmation / parent
 * invite) for storage. The raw token is emailed/linked; only this digest is stored,
 * so a DB leak never exposes a usable token. A 160-bit `randomBytes` token needs no
 * per-token salt (salting defends low-entropy passwords against rainbow tables —
 * bcrypt already does that for our passwords); plain SHA-256 is the standard here.
 *
 * TOKEN_HASH_PEPPER is an OPTIONAL, server-side global pepper for defense-in-depth:
 * a DB leak alone can't be matched against tokens without it. It is a DEDICATED
 * secret, deliberately separate from JWT_SECRET so the two rotate independently and
 * a single leak doesn't compromise both. Unset → empty pepper → a no-op, so local
 * dev / CI need no config; set a value in production to enable it. Changing the
 * pepper invalidates any unredeemed tokens (acceptable — users just request a new one).
 */
export const hashToken = (token: string): string => {
  const pepper = process.env.TOKEN_HASH_PEPPER ?? '';
  return crypto.createHash('sha256').update(`${pepper}${token}`).digest('hex');
};
