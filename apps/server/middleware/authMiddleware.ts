import { ROLE, type Role } from '@sandwicheck/shared';
import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import EXCLUDED_FIELDS from '#constants/excludeFields.ts';
import User from '#models/UserModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';

/*
 * A JWT issued before the user's last password change is revoked — this is what
 * lets change/reset-password evict already-stolen sessions. `iat` is in whole
 * seconds (floored at signing) and passwordChangedAt is backdated 1s on save,
 * so tokens issued at or after the change always pass.
 */
export const isIssuedBeforePasswordChange = (decoded: jwt.JwtPayload, passwordChangedAt?: Date): boolean => {
  if (!passwordChangedAt) {
    return false;
  }
  return (decoded.iat ?? 0) * 1000 < passwordChangedAt.getTime();
};

export const protect = asyncHandler(async (req, res, next) => {
  let token, parentToken;

  /*
   * console.log(req.originalUrl);
   * console.log("Cookies: ", req.cookies);
   * console.log("Signed Cookies: ", req.signedCookies);
   */

  // Token Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    if (req.headers.authorization.split(' ')[2]) {
      // when logged in as a child
      token = req.headers.authorization.split(' ')[2];
      parentToken = req.headers.authorization.split(' ')[1];
    } else {
      //regular login
      token = req.headers.authorization.split(' ')[1];
    }
  }

  // Cookies
  if (req.cookies && req.cookies.childToken && req.cookies.token) {
    // when logged in as a child
    token = req.cookies.childToken;
    parentToken = req.cookies.token;
  } else if (req.cookies && req.cookies.token) {
    //regular login
    token = req.cookies.token;
  }

  if (!token) {
    return next(createHttpError.Unauthorized('Not authorized, no token'));
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;

    req.user = (await User.findById(decoded.id).select(EXCLUDED_FIELDS)) ?? undefined;

    if (!req.user) {
      throw new Error('User not found');
    }

    if (isIssuedBeforePasswordChange(decoded, req.user.passwordChangedAt)) {
      throw new Error('Token issued before the last password change');
    }

    if (parentToken && req.user.roles.includes(ROLE.child)) {
      const parentDecoded = jwt.verify(parentToken, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      req.parentUser = await User.findById(parentDecoded.id).select(EXCLUDED_FIELDS);

      if (!req.parentUser) {
        throw new Error('Parent user not found');
      }

      if (isIssuedBeforePasswordChange(parentDecoded, req.parentUser.passwordChangedAt)) {
        throw new Error('Parent token issued before the last password change');
      }
    }

    next();
  } catch {
    next(createHttpError.Unauthorized('Not authorized, token failed'));
  }
});

export const authorize = (...roles: Role[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user!;
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const sandwichId = Array.isArray(req.params.sandwichId) ? req.params.sandwichId[0] : req.params.sandwichId;

    // Check if user is an admin
    if (user.roles.includes(ROLE.admin)) {
      return next();
    }

    // Check if user has a valid role
    if (roles.length > 0 && !roles.some((role) => user.roles.includes(role))) {
      return next(createHttpError.Forbidden('Not authorized to access this resource'));
    }

    if (userId) {
      // Check if parent-user is accessing their own or their child's profile
      if (
        roles.includes(ROLE.parent) &&
        user.roles.includes(ROLE.parent) &&
        (user._id.equals(userId) || (user.children && user.children.some((childId) => childId.equals(userId))))
      ) {
        return next();
      }

      // Check if any user is accessing their own profile
      if (user._id.equals(userId)) {
        return next();
      }
    }

    /*
     * Owner access for sandwich-scoped routes ONLY (no :userId param).
     * The `!userId` guard is critical: on any user-scoped route that also
     * carried a :sandwichId, a user could otherwise satisfy authorization by
     * passing a victim's userId together with a sandwichId they own (IDOR).
     * No route currently combines both params — the former
     * `/users/:userId/favorite-sandwiches/:sandwichId` route was folded into the
     * idempotent vote endpoint — so this branch only ever runs for
     * sandwich-scoped routes. The guard stays as defense-in-depth in case such a
     * route is reintroduced.
     */
    if (
      !userId &&
      sandwichId &&
      Array.isArray(user.sandwiches) &&
      user.sandwiches.some(
        (ownedSandwichId) => ownedSandwichId.equals?.(sandwichId) || String(ownedSandwichId) === String(sandwichId),
      )
    ) {
      return next();
    }

    // Let create-child pass for parents
    if (!userId && !sandwichId) {
      return next();
    }

    // All other access is disallowed
    return next(createHttpError.Forbidden('Not authorized to access this resource'));
  };
};
