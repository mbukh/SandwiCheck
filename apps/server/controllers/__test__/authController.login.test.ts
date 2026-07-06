import { ERROR_CODE } from '@sandwicheck/shared';
import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({
  default: { findOne: vi.fn(), findOneAndUpdate: vi.fn(), findById: vi.fn() },
}));
vi.mock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('#utils/mailer.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/delay.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/hashAndTokens.ts', () => ({
  generateResetPasswordToken: vi.fn(() => 'raw-token'),
  hashToken: vi.fn(() => 'hashed-token'),
  generatePasswordToken: vi.fn(() => 'jwt'),
}));
vi.mock('#constants/mailing.ts', () => ({
  generateEmailConfirmationHtml: vi.fn(() => '<html>'),
  generateEmailConfirmationText: vi.fn(() => 'text'),
  generateHtmlMessage: vi.fn(() => '<html>'),
  generateTextMessage: vi.fn(() => 'text'),
}));
vi.mock('#utils/manageUserConnections.ts', () => ({ createUserParentsConnections: vi.fn() }));
vi.mock('#utils/cookies.ts', () => ({ setTokenCookie: vi.fn(), removeCookie: vi.fn() }));

const { login } = await import('../authController.ts');
const { default: User } = await import('#models/UserModel.ts');
const { default: bcrypt } = await import('bcryptjs');
const { createUserParentsConnections } = await import('#utils/manageUserConnections.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('login email-confirmation rejection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects an unconfirmed account with a 401 and the EMAIL_NOT_CONFIRMED code', async () => {
    vi.mocked(User.findOne).mockReturnValue({
      select: () =>
        Promise.resolve({
          email: 'user@example.com',
          password: 'hashed',
          emailConfirmed: false,
          isTetheredChild: false,
        }),
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const req = { body: { email: 'user@example.com', password: 'secret1' }, requestId: 'r1' } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    login(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as { status?: number; code?: string } | undefined;
    expect(error?.status).toBe(401);
    expect(error?.code).toBe(ERROR_CODE.emailNotConfirmed);
  });
});

describe('login invite-token consent gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // A confirmed account that authenticates successfully.
    vi.mocked(User.findOne).mockReturnValue({
      select: () =>
        Promise.resolve({
          _id: 'victim-id',
          email: 'victim@example.com',
          password: 'hashed',
          emailConfirmed: true,
          isTetheredChild: false,
        }),
    } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    // Final response fetch (user data without sensitive fields).
    vi.mocked(User.findById).mockReturnValue({
      select: () => Promise.resolve({ _id: 'victim-id', email: 'victim@example.com' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn(() => res) as never;
    res.json = vi.fn(() => res) as never;
    return res;
  };

  it('does not redeem the invite token when acceptInvite is missing', async () => {
    const req = {
      body: { email: 'victim@example.com', password: 'secret1', inviteToken: 'raw-invite' },
      requestId: 'r1',
    } as unknown as Request;
    const res = makeRes();
    const next = vi.fn();

    login(req, res, next);
    await flush();

    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    expect(createUserParentsConnections).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('redeems the invite token once when acceptInvite is true (token consumed, link made)', async () => {
    vi.mocked(User.findOneAndUpdate).mockResolvedValue({ _id: 'parent-id' });

    const req = {
      body: { email: 'victim@example.com', password: 'secret1', inviteToken: 'raw-invite', acceptInvite: true },
      requestId: 'r1',
    } as unknown as Request;
    const res = makeRes();
    const next = vi.fn();

    login(req, res, next);
    await flush();

    // The token is found-and-cleared in a single operation (single-use).
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(vi.mocked(User.findOneAndUpdate).mock.calls[0]?.[1]).toMatchObject({
      $unset: { inviteToken: 1, inviteTokenExpire: 1 },
    });
    expect(createUserParentsConnections).toHaveBeenCalledTimes(1);
    expect(vi.mocked(createUserParentsConnections).mock.calls[0]?.[1]).toBe('parent-id');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
