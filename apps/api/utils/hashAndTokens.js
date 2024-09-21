import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generatePasswordToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const generateResetPasswordToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
