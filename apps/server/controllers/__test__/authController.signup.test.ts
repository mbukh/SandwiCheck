import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({
  default: { findOne: vi.fn(), create: vi.fn(), findOneAndUpdate: vi.fn() },
}));
vi.mock('#utils/mailer.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/delay.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed-password') } }));
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
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { signup } = await import('../authController.ts');
const { default: User } = await import('#models/UserModel.ts');
const { default: sendEmail } = await import('#utils/mailer.ts');
const { default: delay } = await import('#utils/delay.ts');

const VALID_BODY = { name: 'Test User', email: 'user@example.com', password: 'secret1', role: 'parent' };

/** The masked body that every "pending account" branch must return byte-for-byte. */
const MASKED_PENDING = {
  success: true,
  message: 'Please check your email to confirm your account',
  data: { requiresEmailConfirmation: true },
};

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

interface MockUser {
  emailConfirmed: boolean;
  email: string;
  _id: { toString: () => string };
  emailConfirmationResendCount?: number;
  emailConfirmationResendCooldown?: Date;
  name?: string;
  password?: string;
  roles?: string[];
  isTetheredChild?: boolean;
  emailConfirmationToken?: string;
  emailConfirmationExpire?: Date;
  save: ReturnType<typeof vi.fn>;
}

const runSignup = async (
  existing: MockUser | null,
  created?: MockUser,
): Promise<{
  res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  next: ReturnType<typeof vi.fn>;
}> => {
  vi.mocked(User.findOne).mockResolvedValue(existing as never);
  if (created) {
    vi.mocked(User.create).mockResolvedValue(created as never);
  }

  const req = { body: { ...VALID_BODY }, requestId: 'req-1' } as unknown as Request;
  const status = vi.fn();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  const next = vi.fn();

  signup(req, res, next);
  await flush();

  return { res: { status, json }, next };
};

const makeExisting = (overrides: Partial<MockUser>): MockUser => ({
  emailConfirmed: false,
  email: 'user@example.com',
  _id: { toString: () => 'existing-id' },
  save: vi.fn(async () => {}),
  ...overrides,
});

describe('signup masking and resend rate-limiting', () => {
  beforeEach(() => {
    // Clears call history but keeps the mock implementations set in the vi.mock factories above.
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('masks an already-confirmed account: delay, no email, no write, identical body', async () => {
    const existing = makeExisting({ emailConfirmed: true });

    const { res, next } = await runSignup(existing);

    expect(delay).toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(existing.save).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
  });

  it('re-signup on a fresh unconfirmed account sends and increments the count (does not reset it)', async () => {
    const existing = makeExisting({ emailConfirmationResendCount: 2 });

    const { res } = await runSignup(existing);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    // Incremented from 2 -> 3, NOT reset to 0/1.
    expect(existing.emailConfirmationResendCount).toBe(3);
    expect(existing.name).toBe(VALID_BODY.name);
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
  });

  it('re-signup within the cooldown updates credentials but sends no email, same masked body', async () => {
    const existing = makeExisting({ emailConfirmationResendCount: 1, emailConfirmationResendCooldown: new Date() });

    const { res } = await runSignup(existing);

    expect(sendEmail).not.toHaveBeenCalled();
    // Credentials still overwritten (the one credential save), but the count is untouched.
    expect(existing.name).toBe(VALID_BODY.name);
    expect(existing.emailConfirmationResendCount).toBe(1);
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
  });

  it('re-signup at the resend cap sends no email and returns the same masked body', async () => {
    const existing = makeExisting({ emailConfirmationResendCount: 5 });

    const { res } = await runSignup(existing);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(existing.emailConfirmationResendCount).toBe(5);
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
  });

  it('a brand-new account returns the signal payload only (no user fields leaked)', async () => {
    const created: MockUser = {
      emailConfirmed: false,
      email: 'user@example.com',
      _id: { toString: () => 'new-id' },
      isTetheredChild: false,
      save: vi.fn(async () => {}),
    };

    const { res } = await runSignup(null, created);

    expect(User.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
    const payload = res.json.mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect(payload.data).toEqual({ requiresEmailConfirmation: true });
    expect(payload.data).not.toHaveProperty('email');
    expect(payload.data).not.toHaveProperty('roles');
  });

  it('a brand-new account whose confirmation email FAILS returns the identical masked body', async () => {
    const created: MockUser = {
      emailConfirmed: false,
      email: 'user@example.com',
      _id: { toString: () => 'new-id' },
      isTetheredChild: false,
      save: vi.fn(async () => {}),
    };
    // SMTP outage: the send rejects. The response must not betray that this email was brand new.
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error('smtp down'));

    const { res, next } = await runSignup(null, created);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(MASKED_PENDING);
  });
});
