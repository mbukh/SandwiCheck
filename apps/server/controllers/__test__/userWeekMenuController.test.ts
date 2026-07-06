import { DAYS_OF_WEEK } from '@sandwicheck/shared';
import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/SandwichModel.ts', () => ({ default: { exists: vi.fn() } }));
vi.mock('#models/UserModel.ts', () => ({ default: { findById: vi.fn() } }));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { addSandwichToWeekMenu } = await import('../userWeekMenuController.ts');
const { default: Sandwich } = await import('#models/SandwichModel.ts');
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

const day = DAYS_OF_WEEK[0];

describe('addSandwichToWeekMenu sandwich-existence check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects with 404 when the sandwich does not exist (and never loads the user)', async () => {
    vi.mocked(Sandwich.exists).mockResolvedValue(null);

    const { res, status } = makeRes();
    const req = { params: { userId: 'u1', day }, body: { sandwichId: 'missing-sandwich' } } as unknown as Request;
    const next = vi.fn();

    addSandwichToWeekMenu(req, res, next);
    await flush();

    // The existence check runs (with the requested id) and short-circuits before any mutation.
    expect(Sandwich.exists).toHaveBeenCalledWith({ _id: 'missing-sandwich' });
    expect(User.findById).not.toHaveBeenCalled();
    const error = next.mock.calls[0]?.[0] as { status?: number; message?: string } | undefined;
    expect(error?.status).toBe(404);
    expect(error?.message).toBe('Sandwich not found');
    expect(status).not.toHaveBeenCalled();
  });

  it('adds the sandwich to the day menu when it exists', async () => {
    vi.mocked(Sandwich.exists).mockResolvedValue({ _id: 'sw1' } as never);
    const save = vi.fn(async () => {});
    const user = { weekMenu: {} as Record<string, Array<{ sandwichId: unknown; quantity: number }>>, save };
    vi.mocked(User.findById).mockResolvedValue(user);

    const { res, status, json } = makeRes();
    const req = { params: { userId: 'u1', day }, body: { sandwichId: 'sw1' } } as unknown as Request;
    const next = vi.fn();

    addSandwichToWeekMenu(req, res, next);
    await flush();

    expect(Sandwich.exists).toHaveBeenCalledWith({ _id: 'sw1' });
    expect(User.findById).toHaveBeenCalledWith('u1');
    expect(save).toHaveBeenCalledTimes(1);
    expect(user.weekMenu[day]).toEqual([{ sandwichId: 'sw1', quantity: 1 }]);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
