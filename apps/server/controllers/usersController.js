import expressAsyncHandler from 'express-async-handler';
import createHttpError from 'http-errors';

import logger from '../utils/logger.js';
import { PROFILE_PICTURES_DIR } from '../config/dir.js';

import { ROLE } from '../constants/usersConstants.js';
import { NO_USER_SANDWICH_USERNAME } from '../constants/sandwichConstants.js';
import { generateEmailConfirmationHtml, generateEmailConfirmationText } from '../constants/mailing.js';

import { saveBufferToFile, removeFile } from '../utils/fileUtils.js';
import { removeUserConnections } from '../utils/manageUserConnections.js';
import * as hashAndTokens from '../utils/hashAndTokens.js';
import sendEmail from '../utils/mailer.js';

import User from '../models/UserModel.js';
import Sandwich from '../models/SandwichModel.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = expressAsyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({ success: true, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:userId
// @route   GET /api/current
// @access  Private +Parents
export const getUser = expressAsyncHandler(async (req, res, next) => {
  // current user or another userID
  const userId = req.params.userId ? req.params.userId : req.user.id;

  const user = await User.findById(userId).populate('sandwiches').populate('parents').populate('children');

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:userId
// @access  Private +Parents
export const updateUser = expressAsyncHandler(async (req, res, next) => {
  const { name, email, role, dietaryPreferences, removeProfilePicture, unlinkParentId, unlinkChildId } = req.body;
  const imageBuffer = req.file && req.file.buffer;

  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  const oldName = user.name;

  if (name) {
    user.name = name;
  }

  if (email && email !== user.email) {
    user.email = email;
    // Email changed - require re-confirmation
    user.emailConfirmed = false;
    // Reset resend count and cooldown when email changes
    user.emailConfirmationResendCount = 0;
    user.emailConfirmationResendCooldown = undefined;
    
    // Generate new confirmation token and send email
    const confirmationToken = hashAndTokens.generateResetPasswordToken();
    user.emailConfirmationToken = hashAndTokens.hashToken(confirmationToken);
    user.emailConfirmationExpire = Date.now() + parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10);
    
    const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;
    
    // Send confirmation email (don't await to avoid blocking the response)
    sendEmail({
      to: user.email,
      subject: 'Email Confirmation',
      html: generateEmailConfirmationHtml({ user, confirmationURL }),
      text: generateEmailConfirmationText({ user, confirmationURL }),
    }).catch((err) => {
      // Log error but don't fail the request
      logger.error('Failed to send email confirmation:', err);
    });
  }

  if (role) {
    if (role === ROLE.parent && !user.isTetheredChild) {
      user.roles.push(ROLE.parent);
    }
    if (role === ROLE.child) {
      if (user.children && user.children.length) {
        return next(
          createHttpError.BadRequest(
            'This account already has children. Remove all children before changing to a child user',
          ),
        );
      } else {
        user.roles.pull(ROLE.parent);
        user.roles.push(ROLE.child);
      }
    }
  }

  if (dietaryPreferences) {
    user.dietaryPreferences = dietaryPreferences;
  }

  if (unlinkParentId) {
    const res = await removeUserConnections(user, 'parents', unlinkParentId);
    if (res.error) {
      return next(createHttpError.Forbidden(res.error));
    }
  }

  if (unlinkChildId) {
    const res = await removeUserConnections(user, 'children', unlinkChildId);
    if (res.error) {
      return next(createHttpError.Forbidden(res.error));
    }
  }

  if (imageBuffer && !removeProfilePicture) {
    const fileName = `${user._id}.${process.env.PROFILE_IMAGE_EXTENSION}`;
    const res = await saveBufferToFile(imageBuffer, PROFILE_PICTURES_DIR, fileName);
    if (res) {
      user.profilePicture = fileName;
    }
  }

  if (removeProfilePicture) {
    const fileName = user.profilePicture;
    await removeFile(PROFILE_PICTURES_DIR, fileName);
    user.profilePicture = undefined;
  }

  const updatedUser = await user.save();

  if (oldName !== updatedUser.name) {
    await Sandwich.updateMany({ authorId: user.id }, { authorName: updatedUser.firstName });
  }

  res.status(200).json({ success: true, data: updatedUser });
});

// @desc    Delete user
// @route   DELETE /api/users/:userId
// @access  Private / User
export const deleteUser = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  // Remove user from parents' children arrays
  if (user.parents && user.parents.length) {
    await removeUserConnections(user, 'parents');
  }

  // Remove user from children's parents arrays
  if (user.children && user.children.length) {
    await removeUserConnections(user, 'children');
  }

  if (user.sandwiches && user.sandwiches.length) {
    await Sandwich.updateMany({ _id: { $in: user.sandwiches } }, { authorName: NO_USER_SANDWICH_USERNAME });
  }

  // Delete the user
  await User.findByIdAndDelete(req.params.userId);

  const fileName = `${req.params.userId}.${process.env.PROFILE_IMAGE_EXTENSION}`;
  await removeFile(PROFILE_PICTURES_DIR, fileName);

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// @desc    Add / Remove favorite sandwich
// @route   POST | DELETE /api/users/:userId/favorite-sandwiches/:sandwichId
// @access  Private / User
export const updateFavoriteSandwiches = async (req, res, next) => {
  const { userId, sandwichId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  const isSandwichAlreadyFavorite = user.favoriteSandwiches.includes(sandwichId);

  if (req.method === 'POST' && !isSandwichAlreadyFavorite) {
    user.favoriteSandwiches.push(sandwichId);
  } else if (req.method === 'DELETE' && isSandwichAlreadyFavorite) {
    user.favoriteSandwiches.pull(sandwichId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.favoriteSandwiches,
  });
};
