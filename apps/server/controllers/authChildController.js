import createHttpError from 'http-errors';
import expressAsyncHandler from 'express-async-handler';

import { createUserParentsConnections } from '../utils/manageUserConnections.js';
import { setTokenCookie, removeCookie } from '../utils/cookies.js';
import * as hashAndTokens from '../utils/hashAndTokens.js';

import User from '../models/UserModel.js';
import EXCLUDED_FIELDS from '../constants/excludeFields.js';

const populateUserSessionData = async (userId) => {
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
export const createChildUser = expressAsyncHandler(async (request, res, next) => {
  const parentUser = request.user;
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
export const switchToParent = expressAsyncHandler(async (request, res, next) => {
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
export const loginChildUser = expressAsyncHandler(async (request, res, next) => {
  const parentUser = request.user;
  const { childId } = request.body;

  if (!childId) {
    return next(createHttpError.BadRequest('Child ID is required'));
  }

  if (!parentUser.children.includes(childId)) {
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
export const getSession = expressAsyncHandler(async (request, res, next) => {
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
