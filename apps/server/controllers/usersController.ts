import type { ParamsDictionary } from 'express-serve-static-core';
import { ROLE, type UpdateUserDto } from '@sandwicheck/shared';
import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import type mongoose from 'mongoose';
import { PROFILE_PICTURES_DIR } from '#config/dir.ts';
import EXCLUDED_FIELDS from '#constants/excludeFields.ts';
import {
  generateChildActivationHtml,
  generateChildActivationText,
  generateEmailConfirmationHtml,
  generateEmailConfirmationText,
} from '#constants/mailing.ts';
import { NO_USER_SANDWICH_USERNAME } from '#constants/sandwichConstants.ts';
import Sandwich from '#models/SandwichModel.ts';
import User from '#models/UserModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';
import { removeFile, saveBufferToFile } from '#utils/fileUtils.ts';
import * as hashAndTokens from '#utils/hashAndTokens.ts';
import logger from '#utils/logger.ts';
import sendEmail from '#utils/mailer.ts';
import { removeUserConnections } from '#utils/manageUserConnections.ts';

/*
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res, _next) => {
  const users = await User.find({}).select(EXCLUDED_FIELDS);
  res.status(200).json({ success: true, data: users });
});

/*
 * @desc    Get single user
 * @route   GET /api/users/:userId
 * @route   GET /api/current
 * @access  Private +Parents
 */
export const getUser = asyncHandler(async (req, res, next) => {
  // current user or another userID
  const userId = req.params.userId || req.user!.id;

  const user = await User.findById(userId)
    .select(EXCLUDED_FIELDS)
    .populate('sandwiches')
    .populate('parents', EXCLUDED_FIELDS)
    .populate('children', EXCLUDED_FIELDS);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  res.status(200).json({ success: true, data: user });
});

/*
 * @desc    Update user
 * @route   PUT /api/users/:userId
 * @access  Private +Parents
 */
export const updateUser = asyncHandler<ParamsDictionary, unknown, UpdateUserDto>(async (req, res, next) => {
  const { name, email, role, dietaryPreferences, removeProfilePicture, unlinkParentId, unlinkChildId } = req.body;
  const imageBuffer = req.file && req.file.buffer;

  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  const oldName = user.name;
  const initialEmail = user.email;
  const wasTetheredChild = Boolean(user.isTetheredChild && !user.email);

  if (name) {
    user.name = name;
  }

  if (email && email !== initialEmail) {
    user.email = email;
    // Email changed - require re-confirmation
    user.emailConfirmed = false;
    // Reset resend count and cooldown when email changes
    user.emailConfirmationResendCount = 0;
    user.emailConfirmationResendCooldown = undefined;

    // Generate new confirmation token and send email
    const confirmationToken = hashAndTokens.generateResetPasswordToken();
    user.emailConfirmationToken = hashAndTokens.hashToken(confirmationToken);
    user.emailConfirmationExpire = new Date(
      Date.now() + Number.parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_IN || '86400000', 10),
    );

    const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

    if (wasTetheredChild) {
      const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      const temporaryPasswordSeed = hashAndTokens.generateResetPasswordToken();
      user.password = await bcrypt.hash(temporaryPasswordSeed, saltRounds);
      user.isTetheredChild = undefined;

      const resetToken = hashAndTokens.generateResetPasswordToken();
      user.resetPasswordToken = hashAndTokens.hashToken(resetToken);
      user.resetPasswordExpire = new Date(
        Date.now() + Number.parseInt(process.env.RESET_PASSWORD_EXPIRES_IN || '3600000', 10),
      );

      let inviterName: string | undefined;
      if (user.parents?.length) {
        const primaryParent = await User.findById(user.parents[0]).select('name').lean();
        inviterName = primaryParent?.name || undefined;
      } else if (req.parentUser?.name) {
        inviterName = req.parentUser.name;
      } else if (req.user?.roles?.includes(ROLE.parent)) {
        inviterName = req.user.name;
      }

      const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      const emailPayload = {
        childName: user.name,
        parentName: inviterName,
        confirmationURL,
        resetURL,
      };

      sendEmail({
        to: user.email,
        subject: inviterName ? `${inviterName} invited you to SandwiCheck` : 'Activate your SandwiCheck account',
        html: generateChildActivationHtml(emailPayload),
        text: generateChildActivationText(emailPayload),
      }).catch((error) => {
        logger.error('Failed to send child activation email:', error);
      });
    } else {
      // Send confirmation email (don't await to avoid blocking the response)
      sendEmail({
        to: user.email,
        subject: 'Email Confirmation',
        html: generateEmailConfirmationHtml({ user, confirmationURL }),
        text: generateEmailConfirmationText({ user, confirmationURL }),
      }).catch((error) => {
        // Log error but don't fail the request
        logger.error('Failed to send email confirmation:', error);
      });
    }
  }

  if (role) {
    if (role === ROLE.parent && !user.isTetheredChild) {
      user.roles.push(ROLE.parent);
    }
    if (role === ROLE.child) {
      if (user.children && user.children.length > 0) {
        return next(
          createHttpError.BadRequest(
            'This account already has children. Remove all children before changing to a child user',
          ),
        );
      } else {
        (user.roles as mongoose.Types.Array<string>).pull(ROLE.parent);
        user.roles.push(ROLE.child);
      }
    }
  }

  if (dietaryPreferences) {
    user.dietaryPreferences = dietaryPreferences;
  }

  if (unlinkParentId) {
    const res = await removeUserConnections(user, 'parents', unlinkParentId);
    if (res?.error) {
      return next(createHttpError.Forbidden(res.error));
    }
  }

  if (unlinkChildId) {
    const res = await removeUserConnections(user, 'children', unlinkChildId);
    if (res?.error) {
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

/*
 * @desc    Delete user
 * @route   DELETE /api/users/:userId
 * @access  Private / User
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  // Remove user from parents' children arrays
  if (user.parents && user.parents.length > 0) {
    await removeUserConnections(user, 'parents');
  }

  // Remove user from children's parents arrays
  if (user.children && user.children.length > 0) {
    await removeUserConnections(user, 'children');
  }

  if (user.sandwiches && user.sandwiches.length > 0) {
    await Sandwich.updateMany({ _id: { $in: user.sandwiches } }, { authorName: NO_USER_SANDWICH_USERNAME });
  }

  // Delete the user
  await User.findByIdAndDelete(req.params.userId);

  const fileName = `${req.params.userId}.${process.env.PROFILE_IMAGE_EXTENSION}`;
  await removeFile(PROFILE_PICTURES_DIR, fileName);

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});
