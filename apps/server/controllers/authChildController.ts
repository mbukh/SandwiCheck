import type { ParamsDictionary } from 'express-serve-static-core';
import type { CreateChildDto, LoginChildDto } from '@sandwicheck/shared';
import createHttpError from 'http-errors';
import type mongoose from 'mongoose';
import EXCLUDED_FIELDS from '#constants/excludeFields.ts';
import User, { type UserDocument } from '#models/UserModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';
import { removeCookie, setTokenCookie } from '#utils/cookies.ts';
import * as hashAndTokens from '#utils/hashAndTokens.ts';
import { createUserParentsConnections } from '#utils/manageUserConnections.ts';

const populateUserSessionData = async (userId?: mongoose.Types.ObjectId | string): Promise<UserDocument | null> => {
  if (!userId) {
    return null;
  }

  return User.findById(userId)
    .select(EXCLUDED_FIELDS)
    .populate('sandwiches')
    .populate('parents', EXCLUDED_FIELDS)
    .populate('children', EXCLUDED_FIELDS);
};

/*
 * @desc    Create a chid account
 * @route   POST /auth/create-child
 * @access  Private/Parent
 */
export const createChildUser = asyncHandler<ParamsDictionary, unknown, CreateChildDto>(async (request, res, next) => {
  const parentUser = request.user!;
  const { name } = request.body;

  if (!name) {
    return next(createHttpError.BadRequest('Name id required'));
  }

  const childUser = await User.create({
    isTetheredChild: true,
    name,
    parents: [parentUser._id],
  });

  await createUserParentsConnections(childUser, parentUser._id);

  const token = {
    name: 'childToken',
    value: hashAndTokens.generatePasswordToken({ id: childUser._id }),
  };

  setTokenCookie(token, res);

  res.status(200).json({
    success: true,
    data: await populateUserSessionData(childUser._id),
  });
});

/*
 * @desc    Create a chid account
 * @route   POST /auth/switch-to-parent
 * @access  Private/Child
 */
export const switchToParent = asyncHandler(async (request, res, next) => {
  if (!request.parentUser) {
    return next(createHttpError.BadRequest('A logged-in parent required to switch back'));
  }

  removeCookie('childToken', res);

  const token = {
    name: 'token',
    value: hashAndTokens.generatePasswordToken({ id: request.parentUser._id }),
  };

  setTokenCookie(token, res);

  res.status(200).json({
    success: true,
    data: await populateUserSessionData(request.parentUser._id),
  });
});

/*
 * @desc    Login
 * @route   POST /api/auth/login-child
 * @access  Private/Parent
 */
export const loginChildUser = asyncHandler<ParamsDictionary, unknown, LoginChildDto>(async (request, res, next) => {
  const parentUser = request.user!;
  const { childId } = request.body;

  if (!childId) {
    return next(createHttpError.BadRequest('Child ID is required'));
  }

  if (!parentUser.children.includes(childId as unknown as mongoose.Types.ObjectId)) {
    return next(createHttpError.Forbidden('Not authorized to access this child'));
  }

  const childUser = await User.findById(childId);

  if (!childUser) {
    return next(createHttpError.NotFound('Child account not found'));
  }

  const token = {
    name: 'childToken',
    value: hashAndTokens.generatePasswordToken({ id: childUser._id }),
  };

  setTokenCookie(token, res);

  res.status(200).json({
    success: true,
    data: await populateUserSessionData(childUser._id),
  });
});

/*
 * @desc    Get active authenticated session
 * @route   GET /api/auth/session
 * @access  Private
 */
export const getSession = asyncHandler(async (request, res, next) => {
  if (!request.user?._id) {
    return next(createHttpError.Unauthorized('Not authorized, no session found'));
  }

  const activeUser = await populateUserSessionData(request.user._id);

  if (!activeUser) {
    return next(createHttpError.NotFound('Active user not found'));
  }

  let parentUser = null;

  if (request.parentUser?._id) {
    parentUser = await populateUserSessionData(request.parentUser._id);
  }

  res.status(200).json({
    success: true,
    data: {
      activeUser,
      parentUser,
      actingAsChild: Boolean(parentUser),
    },
  });
});

/*
 * @desc    Create a parent invite token used to link children on signup/login
 * @route   POST /api/auth/create-invite
 * @access  Private/Parent
 *
 * Replaces the previous flow where any raw parentId in the request body linked a
 * caller to an arbitrary user without consent. Only the (hashed) token is stored;
 * the raw token is returned once so the parent can share an invite link. The token
 * is single-use: it is consumed the first time a child redeems it, and a new call
 * replaces any previous unused token — so only the most recently generated link is
 * live (one link onboards one child).
 */
export const createInvite = asyncHandler(async (request, res, _next) => {
  const parentUser = request.user!;

  const rawToken = hashAndTokens.generateResetPasswordToken();
  const expiresInMs = Number.parseInt(process.env.INVITE_TOKEN_EXPIRES_IN || '604800000', 10); // default 7 days

  await User.findByIdAndUpdate(parentUser._id, {
    $set: {
      inviteToken: hashAndTokens.hashToken(rawToken),
      inviteTokenExpire: new Date(Date.now() + expiresInMs),
    },
  });

  res.status(200).json({
    success: true,
    data: { token: rawToken },
  });
});
