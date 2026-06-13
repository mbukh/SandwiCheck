import { ERROR_CODE } from '@sandwicheck/shared';
import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({
  default: { findOne: vi.fn(), findById: vi.fn(), findOneAndUpdate: vi.fn(), findByIdAndUpdate: vi.fn() },
}));
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
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { resendConfirmation } = await import('../authController.ts');
const { default: User } = await import('#models/UserModel.ts');
const { default: sendEmail } = await import('#utils/mailer.ts');
const { default: delay } = await import('#utils/delay.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/*
 * The single masked body every "200" branch must return byte-for-byte. Pinning it here is the
 * point of the security test: not-found, already-confirmed, and freshly-sent must be identical so
 * the endpoint can't be used to tell whether an email is registered (or already confirmed).
 */
const MASKED_BODY = {
  success: true,
  message: 'If an account with this email still needs confirmation, a new confirmation email has been sent.',
};

const makeRes = (): { res: Response; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } => {
  const status = vi.fn();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  return { res, status, json };
};

const run = async (
  body: Record<string, unknown>,
): Promise<{ status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; next: ReturnType<typeof vi.fn> }> => {
  const { res, status, json } = makeRes();
  const req = { body, requestId: 'r1', ip: '127.0.0.1' } as unknown as Request;
  const next = vi.fn();
  resendConfirmation(req, res, next);
  await flush();
  return { status, json, next };
};

describe('resendConfirmation enumeration masking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the masked body (and never emails) for an unregistered address', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);

    const { status, json } = await run({ email: 'nobody@example.com' });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(MASKED_BODY);
    expect(delay).toHaveBeenCalledTimes(1); // timing-masked like a real send
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns the SAME masked body (and never emails) for an already-confirmed account', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      _id: 'u1',
      email: 'confirmed@example.com',
      emailConfirmed: true,
    } as never);

    const { status, json } = await run({ email: 'confirmed@example.com' });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(MASKED_BODY);
    // Identical body + jittered delay → indistinguishable from the not-found branch.
    expect(delay).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns the SAME masked body after actually sending to an unconfirmed account', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      _id: 'u1',
      email: 'pending@example.com',
      emailConfirmed: false,
      emailConfirmationResendCount: 0,
      emailConfirmationResendCooldown: undefined,
    } as never);
    // Race-check refetch, then the atomic count bump on a successful send.
    vi.mocked(User.findById).mockReturnValue({
      select: () => Promise.resolve({ emailConfirmationResendCount: 0 }),
    });
    vi.mocked(User.findOneAndUpdate).mockResolvedValue({ emailConfirmationResendCount: 1 });

    const { status, json } = await run({ email: 'pending@example.com' });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    // Same body the not-found / confirmed branches returned — no "email sent" tell.
    expect(json).toHaveBeenCalledWith(MASKED_BODY);
  });
});

describe('resendConfirmation rate-limit signals (unconfirmed accounts only)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers a recent resend with a 429 carrying the remaining cooldown', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      _id: 'u1',
      email: 'pending@example.com',
      emailConfirmed: false,
      emailConfirmationResendCount: 1,
      emailConfirmationResendCooldown: new Date(), // just sent → inside the cooldown window
    } as never);

    const { next, status } = await run({ email: 'pending@example.com' });

    expect(status).not.toHaveBeenCalled();
    const error = next.mock.calls[0]?.[0] as { status?: number; cooldownRemainingMs?: number } | undefined;
    expect(error?.status).toBe(429);
    expect(error?.cooldownRemainingMs).toBeGreaterThan(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('answers an exhausted resend budget with a 403 MAX_RESENDS and invalidates the token', async () => {
    const save = vi.fn(async () => {});
    const user = {
      _id: 'u1',
      email: 'pending@example.com',
      emailConfirmed: false,
      emailConfirmationResendCount: 5,
      emailConfirmationToken: 'still-set',
      emailConfirmationExpire: new Date(),
      save,
    };
    vi.mocked(User.findOne).mockResolvedValue(user as never);

    const { next, status } = await run({ email: 'pending@example.com' });

    expect(status).not.toHaveBeenCalled();
    const error = next.mock.calls[0]?.[0] as { status?: number; code?: string } | undefined;
    expect(error?.status).toBe(403);
    expect(error?.code).toBe(ERROR_CODE.maxResends);
    // The still-valid token is cleared so it can't be used past the cap.
    expect(user.emailConfirmationToken).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
