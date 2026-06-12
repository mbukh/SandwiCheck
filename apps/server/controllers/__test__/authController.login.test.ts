import { ERROR_CODE } from '@sandwicheck/shared';
import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({ default: { findOne: vi.fn() } }));
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
