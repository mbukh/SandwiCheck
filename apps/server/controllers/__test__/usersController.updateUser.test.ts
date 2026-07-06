import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/UserModel.ts', () => ({ default: { findById: vi.fn(), findOne: vi.fn() } }));
vi.mock('#models/SandwichModel.ts', () => ({ default: { updateMany: vi.fn() } }));
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn(async () => 'hashed') } }));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('#utils/mailer.ts', () => ({ default: vi.fn(async () => {}) }));
vi.mock('#utils/fileUtils.ts', () => ({ removeFile: vi.fn(), saveBufferToFile: vi.fn(async () => true) }));
vi.mock('#utils/hashAndTokens.ts', () => ({
  generateResetPasswordToken: vi.fn(() => 'raw-token'),
  hashToken: vi.fn(() => 'hashed-token'),
}));
vi.mock('#utils/manageUserConnections.ts', () => ({ removeUserConnections: vi.fn() }));
vi.mock('#constants/mailing.ts', () => ({
  generateChildActivationHtml: vi.fn(() => '<html>'),
  generateChildActivationText: vi.fn(() => 'text'),
  generateEmailConfirmationHtml: vi.fn(() => '<html>'),
  generateEmailConfirmationText: vi.fn(() => 'text'),
}));

const { updateUser } = await import('../usersController.ts');
const { default: User } = await import('#models/UserModel.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const makeRes = (): { res: Response; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } => {
  const status = vi.fn();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  return { res, status, json };
};

describe('updateUser email handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects a taken email with a neutral message (no value reflected)', async () => {
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'u1',
      email: 'old@example.com',
      name: 'Old',
      save: vi.fn(),
    });
    // Some other account already owns the requested address.
    vi.mocked(User.findOne).mockReturnValue({ select: () => Promise.resolve({ _id: 'someone-else' }) } as never);

    const { res, status } = makeRes();
    const req = { params: { userId: 'u1' }, body: { email: 'TAKEN@Example.com' } } as unknown as Request;
    const next = vi.fn();

    updateUser(req, res, next);
    await flush();

    // Pre-check queries the normalized email and excludes the user's own id.
    expect(User.findOne).toHaveBeenCalledWith({ email: 'taken@example.com', _id: { $ne: 'u1' } });
    const error = next.mock.calls[0]?.[0] as { status?: number; message?: string } | undefined;
    expect(error?.status).toBe(400);
    expect(error?.message).toBe('Unable to update to that email address');
    expect(status).not.toHaveBeenCalled();
  });

  it('treats an own-email casing change as a no-op (no dup check, no re-confirmation)', async () => {
    const user = {
      _id: 'u1',
      email: 'self@example.com',
      name: 'Self',
      emailConfirmed: true,
      save: vi.fn(async () => user),
    };
    vi.mocked(User.findById).mockResolvedValue(user);

    const { res, status } = makeRes();
    const req = { params: { userId: 'u1' }, body: { email: 'SELF@Example.com' } } as unknown as Request;
    const next = vi.fn();

    updateUser(req, res, next);
    await flush();

    expect(User.findOne).not.toHaveBeenCalled();
    expect(user.email).toBe('self@example.com');
    expect(user.emailConfirmed).toBe(true);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
  });
});
