import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sandwich from '../../models/SandwichModel.ts';
import { getSandwiches } from '../sandwichesController.ts';

/** A chainable Mongoose-query stub: every builder method returns the same object. */
const makeQueryStub = (): {
  where: ReturnType<typeof vi.fn>;
  all: ReturnType<typeof vi.fn>;
  sort: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  exec: ReturnType<typeof vi.fn>;
} => {
  const query = {
    where: vi.fn(() => query),
    all: vi.fn(() => query),
    sort: vi.fn(() => query),
    skip: vi.fn(() => query),
    limit: vi.fn(() => query),
    exec: vi.fn(() => Promise.resolve([])),
  };
  return query;
};

// asyncHandler does not return the handler's promise, so let its microtasks settle.
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const runGetSandwiches = async (
  reqQuery: Record<string, unknown>,
): Promise<{ query: ReturnType<typeof makeQueryStub>; next: ReturnType<typeof vi.fn> }> => {
  const query = makeQueryStub();
  vi.spyOn(Sandwich, 'find').mockReturnValue(query as never);

  const req = { query: reqQuery, body: {} } as unknown as Request;
  const res = { status: vi.fn(() => res), json: vi.fn(() => res) } as unknown as Response;
  const next = vi.fn();

  getSandwiches(req, res, next);
  await flush();

  return { query, next };
};

describe('getSandwiches pagination limit', () => {
  beforeEach(() => {
    // The default page size derives from this env var; keep the tests deterministic.
    delete process.env.SANDWICHES_PER_PAGE_DEFAULT;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clamps an oversized ?limit= to the hard ceiling (100)', async () => {
    const { query, next } = await runGetSandwiches({ limit: '100000000' });

    expect(next).not.toHaveBeenCalled();
    expect(query.limit).toHaveBeenCalledWith(100);
  });

  it('uses the default page size (48) when no limit is given', async () => {
    const { query } = await runGetSandwiches({});

    expect(query.limit).toHaveBeenCalledWith(48);
  });

  it('falls back to the default page size for a non-numeric limit', async () => {
    const { query } = await runGetSandwiches({ limit: 'banana' });

    expect(query.limit).toHaveBeenCalledWith(48);
  });

  it('passes a within-cap limit through unchanged', async () => {
    const { query } = await runGetSandwiches({ limit: '10' });

    expect(query.limit).toHaveBeenCalledWith(10);
  });
});
