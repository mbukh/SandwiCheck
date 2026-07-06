import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({ default: { findOne: vi.fn() } }));
vi.mock('#utils/delay.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/mailer.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('#utils/hashAndTokens.ts', () => ({
  generateResetPasswordToken: vi.fn(() => 'raw-token'),
  hashToken: vi.fn(() => 'hashed-token'),
}));
vi.mock('#constants/mailing.ts', () => ({
  generateEmailConfirmationHtml: vi.fn(() => '<html>'),
  generateEmailConfirmationText: vi.fn(() => 'text'),
  generateHtmlMessage: vi.fn(() => '<html>'),
  generateTextMessage: vi.fn(() => 'text'),
}));
vi.mock('#utils/manageUserConnections.ts', () => ({ createUserParentsConnections: vi.fn() }));

const { forgotPassword } = await import('../authController.ts');
const { default: User } = await import('#models/UserModel.ts');
const { default: delay } = await import('#utils/delay.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('forgotPassword for an unknown email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a single masked 200 and never calls next() (so the error handler is not re-entered)', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);

    const status = vi.fn();
    const json = vi.fn();
    const res = { status, json } as unknown as Response;
    status.mockReturnValue(res);
    json.mockReturnValue(res);
    const req = { body: { email: 'nobody@example.com' }, requestId: 'r1' } as unknown as Request;
    const next = vi.fn();

    forgotPassword(req, res, next);
    await flush();

    expect(delay).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith({ success: true, message: 'Reset password email sent' });
    expect(next).not.toHaveBeenCalled();
  });
});
