import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({ default: { findOne: vi.fn() } }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn(async () => 'new-hashed') } }));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('#utils/hashAndTokens.ts', () => ({
  hashToken: vi.fn(() => 'hashed-token'),
}));
vi.mock('#constants/mailing.ts', () => ({
  generateEmailConfirmationHtml: vi.fn(() => '<html>'),
  generateEmailConfirmationText: vi.fn(() => 'text'),
  generateHtmlMessage: vi.fn(() => '<html>'),
  generateTextMessage: vi.fn(() => 'text'),
}));
vi.mock('#utils/manageUserConnections.ts', () => ({ createUserParentsConnections: vi.fn() }));

const { resetPassword } = await import('../authController.ts');
const { default: User } = await import('#models/UserModel.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('resetPassword recovers a resend-maxed unconfirmed account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('confirms the email and clears the resend budget when the reset succeeds', async () => {
    // An unconfirmed account that has exhausted its confirmation-email resends.
    const user = {
      password: 'old-hashed',
      resetPasswordToken: 'hashed-token',
      resetPasswordExpire: new Date(Date.now() + 60_000),
      emailConfirmed: false,
      emailConfirmationResendCount: 5,
      emailConfirmationResendCooldown: new Date(),
      emailConfirmationToken: 'tok',
      emailConfirmationExpire: new Date(),
      save: vi.fn(async () => {}),
    };
    vi.mocked(User.findOne).mockResolvedValue(user as never);

    const status = vi.fn();
    const json = vi.fn();
    const res = { status, json } as unknown as Response;
    status.mockReturnValue(res);
    json.mockReturnValue(res);
    const req = {
      body: { newPassword: 'brandnew1' },
      params: { resetToken: 'raw' },
      requestId: 'r1',
    } as unknown as Request;
    const next = vi.fn();

    resetPassword(req, res, next);
    await flush();

    expect(next).not.toHaveBeenCalled();
    expect(user.emailConfirmed).toBe(true);
    expect(user.emailConfirmationResendCount).toBe(0);
    expect(user.emailConfirmationResendCooldown).toBeUndefined();
    expect(user.emailConfirmationToken).toBeUndefined();
    expect(user.emailConfirmationExpire).toBeUndefined();
    expect(user.resetPasswordToken).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
  });
});
