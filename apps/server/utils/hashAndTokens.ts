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

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
