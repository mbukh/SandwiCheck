import type { ParamsDictionary } from 'express-serve-static-core';
import {
  type ChangePasswordDto,
  ERROR_CODE,
  type ForgotPasswordDto,
  formatDuration,
  type LoginDto,
  type ResendConfirmationDto,
  type ResetPasswordDto,
  ROLE,
  type SignupDto,
} from '@sandwicheck/shared';
import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import EXCLUDED_FIELDS from '#constants/excludeFields.ts';
import {
  generateEmailConfirmationHtml,
  generateEmailConfirmationText,
  generateHtmlMessage,
  generateTextMessage,
} from '#constants/mailing.ts';
import User from '#models/UserModel.ts';
import asyncHandler from '#utils/asyncHandler.ts';
import { removeCookie, setTokenCookie } from '#utils/cookies.ts';
import delay from '#utils/delay.ts';
import * as hashAndTokens from '#utils/hashAndTokens.ts';
import logger from '#utils/logger.ts';
import sendEmail from '#utils/mailer.ts';
import { createUserParentsConnections } from '#utils/manageUserConnections.ts';

/*
 * @desc    Signup
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler<ParamsDictionary, unknown, SignupDto>(async (req, res, next) => {
  // Sanitize and trim inputs
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const role = req.body.role?.trim();
  const parentId = req.body.parentId?.trim();

  if (!name || !email || !password || !role) {
    return next(createHttpError.BadRequest('All fields are required'));
  }

  if (role !== ROLE.child && role !== ROLE.parent) {
    return next(createHttpError.BadRequest('Choose a valid user role: either child or parent'));
  }

  if (password.length < 5 || password.length > 30) {
    return next(createHttpError.BadRequest('A password must contain between 5 and 30 characters'));
  }

  const userExists = await User.findOne({ email });

  // Handle duplicate signup - if user exists but not confirmed, invalidate old token and generate new one
  if (userExists) {
    if (userExists.emailConfirmed) {
      return next(createHttpError.BadRequest('User already exists'));
    }
    /*
     * User exists but not confirmed - invalidate old token and generate new one
     * Reset resend count and cooldown to give user a fresh start
     */
    const confirmationToken = hashAndTokens.generateResetPasswordToken();
    userExists.emailConfirmationToken = hashAndTokens.hashToken(confirmationToken);
    userExists.emailConfirmationExpire = new Date(
      Date.now() + Number.parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10),
    );
    userExists.emailConfirmationResendCount = 0; // Reset resend count on new signup attempt
    userExists.emailConfirmationResendCooldown = undefined; // Reset cooldown on new signup attempt
    userExists.name = name;
    userExists.password = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_SALT_ROUND ?? '', 10));
    userExists.roles = [ROLE.user, role];

    await userExists.save();

    const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

    try {
      await sendEmail({
        to: userExists.email!,
        subject: 'Email Confirmation',
        html: generateEmailConfirmationHtml({ user: userExists, confirmationURL }),
        text: generateEmailConfirmationText({ user: userExists, confirmationURL }),
      });

      return res.status(200).json({
        success: true,
        message: 'Please check your email to confirm your account',
        data: userExists,
      });
    } catch (emailError) {
      // Log email sending error (PII will be automatically masked)
      logger.error('Failed to send confirmation email during signup', {
        requestId: req.requestId,
        userId: userExists._id.toString(),
        error: emailError,
      });

      // Don't fail the signup - user is created, they can request resend
      return res.status(200).json({
        success: true,
        message:
          'Account created, but confirmation email could not be sent. Please use the resend confirmation option.',
        data: userExists,
      });
    }
  }

  const passwordHash = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_SALT_ROUND ?? '', 10));

  const user = await User.create({
    name,
    email,
    roles: [ROLE.user, role],
    password: passwordHash,
    emailConfirmed: false,
  });

  if (!user) {
    return next(createHttpError.BadRequest('Invalid user data'));
  }

  if (parentId) {
    const res: unknown = await createUserParentsConnections(user, parentId);
    if (!res) {
      return next(new createHttpError.BadRequest('Parent not found'));
    }
  }

  // Skip email confirmation for tethered children (no email)
  const isTetheredChild = user.isTetheredChild || !user.email;

  if (isTetheredChild) {
    // Tethered children don't need email confirmation - log them in immediately
    user.emailConfirmed = true;
    await user.save();

    const token = {
      name: 'token',
      value: hashAndTokens.generatePasswordToken({ id: user._id }),
    };

    setTokenCookie(token, res);

    return res.status(200).json({
      success: true,
      data: user,
    });
  }

  // Generate email confirmation token for regular users
  const confirmationToken = hashAndTokens.generateResetPasswordToken();
  user.emailConfirmationToken = hashAndTokens.hashToken(confirmationToken);
  user.emailConfirmationExpire = new Date(
    Date.now() + Number.parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10),
  );

  await user.save();

  const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

  try {
    await sendEmail({
      to: user.email!,
      subject: 'Email Confirmation',
      html: generateEmailConfirmationHtml({ user, confirmationURL }),
      text: generateEmailConfirmationText({ user, confirmationURL }),
    });

    // DO NOT log user in - they need to confirm email first
    res.status(200).json({
      success: true,
      message: 'Please check your email to confirm your account',
      data: user,
    });
  } catch (emailError) {
    // Log email sending error (PII will be automatically masked)
    logger.error('Failed to send confirmation email during signup', {
      requestId: req.requestId,
      userId: user._id.toString(),
      error: emailError,
    });

    // Don't fail the signup - user is created, they can request resend
    res.status(200).json({
      success: true,
      message: 'Account created, but confirmation email could not be sent. Please use the resend confirmation option.',
      data: user,
    });
  }
});

/*
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler<ParamsDictionary, unknown, LoginDto>(async (req, res, next) => {
  // Sanitize and trim inputs
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const parentId = req.body.parentId?.trim();

  if (!email || !password) {
    return next(new createHttpError.BadRequest('Please provide an email and password'));
  }

  // Only fetch user data needed for authentication - don't populate unnecessary relations
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password ?? ''))) {
    return next(createHttpError.Unauthorized('Invalid email or password'));
  }

  // Check email confirmation (skip for tethered children)
  const isTetheredChild = user.isTetheredChild || !user.email;
  if (!isTetheredChild && !user.emailConfirmed) {
    return next(createHttpError.Unauthorized('Please confirm your email before logging in'));
  }

  if (parentId) {
    const res: unknown = await createUserParentsConnections(user, parentId);
    if (!res) {
      return next(new createHttpError.BadRequest('Parent not found'));
    }
  }

  const token = {
    name: 'token',
    value: hashAndTokens.generatePasswordToken({ id: user._id }),
  };

  setTokenCookie(token, res);

  /*
   * Return user data without sensitive fields (password already excluded by model transform)
   * Fetch fresh user data without password field to ensure clean response
   */
  const userData = await User.findById(user._id).select(EXCLUDED_FIELDS);

  res.status(200).json({
    success: true,
    data: userData,
  });
});

/*
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler<ParamsDictionary, unknown, ChangePasswordDto>(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  if (!oldPassword || !newPassword) {
    return next(createHttpError.BadRequest('Both old and new passwords are required to change password'));
  }

  if (newPassword.length < 5 || newPassword.length > 30) {
    return next(createHttpError.BadRequest('A password must contain between 5 and 30 characters'));
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password ?? '');

  if (!isPasswordMatch) {
    return next(createHttpError.Unauthorized('Old password is incorrect'));
  }

  user.password = await bcrypt.hash(newPassword, Number.parseInt(process.env.BCRYPT_SALT_ROUND ?? '', 10));

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully, you may log in now',
  });
});

/*
 * @desc    Request forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler<ParamsDictionary, unknown, ForgotPasswordDto>(async (req, res, next) => {
  // Sanitize and trim email input
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return next(createHttpError.BadRequest('Email is required'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    // SECURITY REASON NOT TO REPORT ABOUT NON EXISTING USER AND FAKE SENDING EMAIL
    await delay(2000 + Math.random() * 2000);

    res.status(200).json({
      success: true,
      message: 'Reset password email sent',
    });

    return next();
  }

  const resetToken = hashAndTokens.generateResetPasswordToken();

  user.resetPasswordToken = hashAndTokens.hashToken(resetToken);
  user.resetPasswordExpire = new Date(
    Date.now() + Number.parseInt(process.env.RESET_PASSWORD_EXPIRES_I || '3600000', 10),
  ); // Default 1 hour

  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email!,
    subject: 'Password Reset',
    html: generateHtmlMessage({ user, resetURL }),
    text: generateTextMessage({ user, resetURL }),
  });

  res.status(200).json({
    success: true,
    message: 'Reset password email sent',
  });
});

/*
 * @desc    Request reset password
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = asyncHandler<ParamsDictionary, unknown, ResetPasswordDto>(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return next(createHttpError.BadRequest('A new password is required'));
  }

  const resetPasswordToken = hashAndTokens.hashToken(String(req.params.resetToken));

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(createHttpError.Unauthorized('Invalid token'));
  }

  // Hash the new password before saving
  user.password = await bcrypt.hash(newPassword, Number.parseInt(process.env.BCRYPT_SALT_ROUND ?? '', 10));
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully. You may log in now',
  });
});

/*
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  Private
 */

export const logout = asyncHandler(async (req, res, _next) => {
  removeCookie('token', res);
  removeCookie('childToken', res);

  res.status(200).json({
    success: true,
    message: 'User logged out',
  });
});

/*
 * @desc    Confirm email
 * @route   GET /api/auth/confirm-email/:token
 * @access  Public
 */
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const confirmationToken = hashAndTokens.hashToken(String(req.params.token));
  const MAX_RESEND_COUNT = 5; // Must match resendConfirmation MAX_RESEND_COUNT

  // First, try to find user with valid (non-expired) token
  let user = await User.findOne({
    emailConfirmationToken: confirmationToken,
    emailConfirmationExpire: { $gt: Date.now() },
  });

  // If not found with valid token, check for expired token (token exists but expired)
  if (!user) {
    user = await User.findOne({
      emailConfirmationToken: confirmationToken,
      emailConfirmationExpire: { $exists: true, $lte: Date.now() },
    });

    // If found with expired token and already confirmed, return success (idempotent)
    if (user && user.emailConfirmed) {
      return res.status(200).json({
        success: true,
        message: 'Email already confirmed. You can log in now.',
      });
    }

    // If found with expired token but not confirmed, return expired error
    if (user && !user.emailConfirmed) {
      // Use delay for timing attack prevention
      await delay(2000 + Math.random() * 2000);
      const error = createHttpError.Unauthorized(
        'This confirmation link has expired and is no longer valid. Confirmation links are valid for a limited time. Please request a new confirmation email from the login page.',
      );
      error.code = ERROR_CODE.tokenExpired;
      return next(error);
    }

    /*
     * Token not found - invalid token
     * Use delay for timing attack prevention
     */
    await delay(2000 + Math.random() * 2000);
    const error = createHttpError.Unauthorized('Invalid confirmation token. Please check your confirmation link.');
    error.code = ERROR_CODE.tokenInvalid;
    return next(error);
  }

  // User found with valid token - check if already confirmed (idempotent)
  if (user.emailConfirmed) {
    return res.status(200).json({
      success: true,
      message: 'Email already confirmed. You can log in now.',
    });
  }

  // Check if max resend count reached - prevent confirmation even with valid token
  const resendCount = user.emailConfirmationResendCount || 0;
  if (resendCount >= MAX_RESEND_COUNT) {
    // Log security event (PII will be automatically masked)
    logger.warn('Email confirmation attempted after max resends', {
      requestId: req.requestId,
      userId: user._id.toString(),
      ip: req.ip || 'unknown',
    });

    // Invalidate token
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpire = undefined;
    await user.save();

    const error = createHttpError.Forbidden(
      'Maximum number of confirmation email resends reached. Please contact support for assistance.',
    );
    error.code = ERROR_CODE.maxResends;
    return next(error);
  }

  /*
   * Confirm email - keep token for idempotent checks (will expire naturally)
   * This allows us to identify the user if they click the link again
   */
  user.emailConfirmed = true;
  // Reset resend count and cooldown on successful confirmation
  user.emailConfirmationResendCount = 0;
  user.emailConfirmationResendCooldown = undefined;
  /*
   * Note: We keep the token so we can identify the user if they click the link again
   * The token will expire naturally based on emailConfirmationExpire
   */

  await user.save();

  // Log successful confirmation (PII will be automatically masked in production)
  logger.info('Email confirmed successfully', {
    requestId: req.requestId,
    userId: user._id.toString(),
  });

  res.status(200).json({
    success: true,
    message: 'Email confirmed successfully. You can now log in.',
  });
});

/*
 * @desc    Resend email confirmation
 * @route   POST /api/auth/resend-confirmation
 * @access  Public
 */
export const resendConfirmation = asyncHandler<ParamsDictionary, unknown, ResendConfirmationDto>(
  async (req, res, next) => {
    // Sanitize and trim email input
    const email = req.body.email?.trim().toLowerCase();
    const MAX_RESEND_COUNT = 5;
    // Cooldown period: 15 minutes (900000 ms) - can be configured via env var
    const RESEND_COOLDOWN_MS = Number.parseInt(process.env.EMAIL_CONFIRMATION_RESEND_COOLDOWN_MS || '900000', 10);

    if (!email) {
      return next(createHttpError.BadRequest('Email is required'));
    }

    const user = await User.findOne({ email });

    // Security: Don't reveal if user exists - use delay + fake success
    if (!user) {
      await delay(2000 + Math.random() * 2000);
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a confirmation email has been sent',
      });
    }

    // If already confirmed, return appropriate message
    if (user.emailConfirmed) {
      return res.status(200).json({
        success: true,
        message: 'Email is already confirmed. You can log in now.',
      });
    }

    // Check if max resend count reached - reject before cooldown check
    const currentResendCount = user.emailConfirmationResendCount || 0;
    if (currentResendCount >= MAX_RESEND_COUNT) {
      // Log security event (PII will be automatically masked)
      logger.warn('Email confirmation resend limit exceeded', {
        requestId: req.requestId,
        userId: user._id.toString(),
        ip: req.ip || 'unknown',
      });

      // Invalidate existing token to prevent confirmation
      user.emailConfirmationToken = undefined;
      user.emailConfirmationExpire = undefined;
      await user.save();

      const error = createHttpError.Forbidden(
        'Maximum number of confirmation email resends reached. Please contact support for assistance.',
      );
      error.code = ERROR_CODE.maxResends;
      return next(error);
    }

    // Check cooldown period - must wait before resending
    const now = Date.now();
    const lastResendTime = user.emailConfirmationResendCooldown
      ? new Date(user.emailConfirmationResendCooldown).getTime()
      : 0;
    const timeSinceLastResend = now - lastResendTime;

    if (lastResendTime > 0 && timeSinceLastResend < RESEND_COOLDOWN_MS) {
      const remainingCooldownMs = RESEND_COOLDOWN_MS - timeSinceLastResend;

      // Log cooldown violation (PII will be automatically masked)
      logger.warn('Email confirmation resend cooldown violation', {
        requestId: req.requestId,
        userId: user._id.toString(),
        ip: req.ip || 'unknown',
        remainingSeconds: Math.ceil(remainingCooldownMs / 1000),
      });

      // Show precise time remaining
      const timeMessage = formatDuration(remainingCooldownMs);

      const error = createHttpError.TooManyRequests(
        `Please wait ${timeMessage} before requesting another confirmation email.`,
      );
      // Attach cooldown time in milliseconds to the error for UI countdown
      error.cooldownRemainingMs = remainingCooldownMs;
      return next(error);
    }

    // Generate token first (before any DB updates)
    const confirmationToken = hashAndTokens.generateResetPasswordToken();
    const hashedToken = hashAndTokens.hashToken(confirmationToken);
    const tokenExpire = Date.now() + Number.parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10);

    /*
     * Refresh user data one more time before attempting to send email to catch race conditions
     * This ensures we have the latest count before sending email
     */
    const refreshedUser = await User.findById(user._id).select('emailConfirmationResendCount');
    if (!refreshedUser) {
      return next(createHttpError.NotFound('User not found'));
    }

    const currentResendCountCheck = refreshedUser.emailConfirmationResendCount || 0;
    if (currentResendCountCheck >= MAX_RESEND_COUNT) {
      logger.warn('Email confirmation resend limit exceeded (race condition)', {
        requestId: req.requestId,
        userId: user._id.toString(),
        ip: req.ip || 'unknown',
      });
      const error = createHttpError.Forbidden(
        'Maximum number of confirmation email resends reached. Please contact support for assistance.',
      );
      error.code = ERROR_CODE.maxResends;
      return next(error);
    }

    const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

    // Try to send email FIRST - only increment count and set cooldown if email succeeds
    try {
      await sendEmail({
        to: user.email!,
        subject: 'Email Confirmation',
        html: generateEmailConfirmationHtml({ user, confirmationURL }),
        text: generateEmailConfirmationText({ user, confirmationURL }),
      });

      // Email sent successfully - NOW update count, cooldown, and token atomically
      const updateResult = await User.findOneAndUpdate(
        {
          _id: user._id,
          emailConfirmationResendCount: { $lt: MAX_RESEND_COUNT }, // Double-check count hasn't changed
        },
        {
          $inc: { emailConfirmationResendCount: 1 },
          $set: {
            emailConfirmationResendCooldown: new Date(now),
            emailConfirmationToken: hashedToken,
            emailConfirmationExpire: tokenExpire,
          },
        },
        { new: true },
      );

      /*
       * If update failed (count was already at max), this is a race condition
       * Invalidate the token we just sent to prevent its use, and log security event
       */
      if (updateResult) {
        // Log successful resend attempt (PII will be automatically masked)
        logger.info('Email confirmation resent', {
          requestId: req.requestId,
          userId: user._id.toString(),
          resendCount: updateResult.emailConfirmationResendCount,
        });
      } else {
        logger.warn('Email sent but count update failed (race condition)', {
          requestId: req.requestId,
          userId: user._id.toString(),
          ip: req.ip || 'unknown',
        });

        /*
         * Invalidate the token we just sent since count was already at max
         * This prevents the user from using a token sent after limit was reached
         */
        await User.findByIdAndUpdate(user._id, {
          $set: {
            emailConfirmationToken: undefined,
            emailConfirmationExpire: undefined,
          },
        });

        /*
         * Still return success since email was sent, but token is now invalid
         * This is a rare race condition edge case
         */
      }

      res.status(200).json({
        success: true,
        message: 'Confirmation email sent. Please check your inbox.',
      });
    } catch (emailError) {
      // Log email sending error (PII will be automatically masked)
      logger.error('Failed to send confirmation email', {
        requestId: req.requestId,
        userId: user._id.toString(),
        error: emailError,
      });

      /*
       * Email failed - do NOT increment count or set cooldown
       * User can retry immediately without penalty
       */
      return next(
        new createHttpError.InternalServerError('Failed to send confirmation email. Please try again later.'),
      );
    }
  },
);
