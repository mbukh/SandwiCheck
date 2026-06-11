import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import User from '../../models/UserModel.ts';
import { isIssuedBeforePasswordChange, protect } from '../authMiddleware.ts';

const TEST_SECRET = 'protect-test-secret';

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

const signToken = (id: string, iat: number): string => jwt.sign({ id, iat }, TEST_SECRET, { expiresIn: '30d' });

const mockUserLookup = (user: Record<string, unknown>): void => {
  vi.spyOn(User, 'findById').mockReturnValue({
    select: () => Promise.resolve(user),
  });
};

const invokeProtect = async (token: string): Promise<ReturnType<typeof vi.fn>> => {
  const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn();
  await protect(req, res, next);
  return next;
};

describe('isIssuedBeforePasswordChange', () => {
  it('passes when the user never changed their password', () => {
    expect(isIssuedBeforePasswordChange({ iat: nowSeconds() })).toBe(false);
  });

  it('revokes a token issued before the change', () => {
    const changedAt = new Date();
    expect(isIssuedBeforePasswordChange({ iat: nowSeconds() - 3600 }, changedAt)).toBe(true);
  });

  it('passes a token issued after the change', () => {
    const changedAt = new Date(Date.now() - 60_000);
    expect(isIssuedBeforePasswordChange({ iat: nowSeconds() }, changedAt)).toBe(false);
  });

  it('passes a token signed within the same second as the (1s-backdated) change', () => {
    // pre-save stamps passwordChangedAt = saveTime - 1000; iat is floor(saveTime/1000)
    const saveTime = Date.now();
    const changedAt = new Date(saveTime - 1000);
    expect(isIssuedBeforePasswordChange({ iat: Math.floor(saveTime / 1000) }, changedAt)).toBe(false);
  });

  it('treats a token with no iat as issued before any change', () => {
    expect(isIssuedBeforePasswordChange({}, new Date())).toBe(true);
  });
});

describe('protect middleware password-change revocation', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects a token issued before the last password change with a 401', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    mockUserLookup({ roles: ['user'], passwordChangedAt: new Date() });

    const staleToken = signToken(userId, nowSeconds() - 3600);
    const next = await invokeProtect(staleToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]?.status).toBe(401);
  });

  it('accepts a token issued after the last password change', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    mockUserLookup({ roles: ['user'], passwordChangedAt: new Date(Date.now() - 3_600_000) });

    const freshToken = signToken(userId, nowSeconds());
    const next = await invokeProtect(freshToken);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });

  it('accepts tokens for users who never changed their password', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    mockUserLookup({ roles: ['user'] });

    const token = signToken(userId, nowSeconds());
    const next = await invokeProtect(token);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });
});
