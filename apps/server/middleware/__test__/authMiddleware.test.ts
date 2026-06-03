import { ROLE } from '@sandwicheck/shared';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import { authorize } from '../authMiddleware.ts';

interface MockUser {
  _id: mongoose.Types.ObjectId;
  roles: string[];
  sandwiches: mongoose.Types.ObjectId[];
  children: mongoose.Types.ObjectId[];
}

const makeUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  _id: new mongoose.Types.ObjectId(),
  roles: [ROLE.user],
  sandwiches: [],
  children: [],
  ...overrides,
});

/** Invoke an authorize() middleware with a mock req and return the spied next(). */
const invoke = async (
  roles: Parameters<typeof authorize>,
  user: MockUser,
  params: Record<string, string>,
): Promise<ReturnType<typeof vi.fn>> => {
  const req = { user, params } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn();
  await authorize(...roles)(req, res, next);
  return next;
};

const wasAllowed = (next: ReturnType<typeof vi.fn>): boolean =>
  next.mock.calls.length === 1 && next.mock.calls[0]?.[0] === undefined;

const forbiddenStatus = (next: ReturnType<typeof vi.fn>): number | undefined => next.mock.calls[0]?.[0]?.status;

describe('authorize middleware', () => {
  it('allows a user to edit their OWN favorites (userId + sandwichId, own profile)', async () => {
    const user = makeUser();
    const sandwichId = new mongoose.Types.ObjectId().toString();
    const next = await invoke([ROLE.user], user, { userId: user._id.toString(), sandwichId });
    expect(wasAllowed(next)).toBe(true);
  });

  it('BLOCKS editing another user’s favorites even when the actor owns the sandwich (IDOR regression)', async () => {
    const ownedSandwich = new mongoose.Types.ObjectId();
    const attacker = makeUser({ sandwiches: [ownedSandwich] });
    const victimId = new mongoose.Types.ObjectId().toString();
    const next = await invoke([ROLE.user], attacker, { userId: victimId, sandwichId: ownedSandwich.toString() });
    expect(forbiddenStatus(next)).toBe(403);
  });

  it('allows the owner on a sandwich-scoped route (no userId)', async () => {
    const ownedSandwich = new mongoose.Types.ObjectId();
    const owner = makeUser({ sandwiches: [ownedSandwich] });
    const next = await invoke([ROLE.user], owner, { sandwichId: ownedSandwich.toString() });
    expect(wasAllowed(next)).toBe(true);
  });

  it('blocks a non-owner on a sandwich-scoped route', async () => {
    const owner = makeUser({ sandwiches: [new mongoose.Types.ObjectId()] });
    const next = await invoke([ROLE.user], owner, { sandwichId: new mongoose.Types.ObjectId().toString() });
    expect(forbiddenStatus(next)).toBe(403);
  });

  it('lets an admin bypass all checks', async () => {
    const admin = makeUser({ roles: [ROLE.user, ROLE.admin] });
    const next = await invoke([ROLE.admin], admin, { userId: new mongoose.Types.ObjectId().toString() });
    expect(wasAllowed(next)).toBe(true);
  });

  it('forbids a user lacking the required role', async () => {
    const user = makeUser({ roles: [ROLE.user] });
    const next = await invoke([ROLE.admin], user, {});
    expect(forbiddenStatus(next)).toBe(403);
  });

  it('allows a parent to act on their own child', async () => {
    const childId = new mongoose.Types.ObjectId();
    const parent = makeUser({ roles: [ROLE.user, ROLE.parent], children: [childId] });
    const next = await invoke([ROLE.user, ROLE.parent], parent, { userId: childId.toString() });
    expect(wasAllowed(next)).toBe(true);
  });

  it('forbids a parent from acting on an unrelated user', async () => {
    const parent = makeUser({ roles: [ROLE.user, ROLE.parent], children: [new mongoose.Types.ObjectId()] });
    const next = await invoke([ROLE.user, ROLE.parent], parent, { userId: new mongoose.Types.ObjectId().toString() });
    expect(forbiddenStatus(next)).toBe(403);
  });
});
