import createHttpError from 'http-errors';
import expressAsyncHandler from 'express-async-handler';
// eslint-disable-next-line no-unused-vars
import colors from 'colors';

import bcrypt from 'bcryptjs';

import { ROLE } from '../constants/usersConstants.js';
import {
  generateHtmlMessage,
  generateTextMessage,
  generateEmailConfirmationHtml,
  generateEmailConfirmationText,
} from '../constants/mailing.js';

import { createUserParentsConnections } from '../utils/manageUserConnections.js';
import { setTokenCookie, removeCookie } from '../utils/cookies.js';
import * as hashAndTokens from '../utils/hashAndTokens.js';
import sendEmail from '../utils/mailer.js';
import delay from '../utils/delay.js';
import EXCLUDED_FIELDS from '../constants/excludeFields.js';

import User from '../models/UserModel.js';

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signup = expressAsyncHandler(async (req, res, next) => {
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
    return next(
      createHttpError.BadRequest('A password must contain between 5 and 30 characters'),
    );
  }

  const userExists = await User.findOne({ email });

  // Handle duplicate signup - if user exists but not confirmed, invalidate old token and generate new one
  if (userExists) {
    if (userExists.emailConfirmed) {
      return next(createHttpError.BadRequest('User already exists'));
    }
    // User exists but not confirmed - invalidate old token and generate new one
    // Reset resend count and cooldown to give user a fresh start
    const confirmationToken = hashAndTokens.generateResetPasswordToken();
    userExists.emailConfirmationToken = hashAndTokens.hashToken(confirmationToken);
    userExists.emailConfirmationExpire =
      Date.now() + parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10);
    userExists.emailConfirmationResendCount = 0; // Reset resend count on new signup attempt
    userExists.emailConfirmationResendCooldown = undefined; // Reset cooldown on new signup attempt
    userExists.name = name;
    userExists.password = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND, 10));
    userExists.roles = [ROLE.user, role];

    await userExists.save();

    const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

    try {
      await sendEmail({
        to: userExists.email,
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
      // Log email sending error
      console.error(
        `[ERROR] Failed to send confirmation email during signup for user: ${userExists._id}, email: ${userExists.email}`.red,
        emailError,
      );

      // Don't fail the signup - user is created, they can request resend
      return res.status(200).json({
        success: true,
        message: 'Account created, but confirmation email could not be sent. Please use the resend confirmation option.',
        data: userExists,
      });
    }
  }

  const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND, 10));

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
    const res = await createUserParentsConnections(user, parentId);
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
  user.emailConfirmationExpire = Date.now() + parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10);

  await user.save();

  const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

  try {
    await sendEmail({
      to: user.email,
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
    // Log email sending error
    console.error(
      `[ERROR] Failed to send confirmation email during signup for user: ${user._id}, email: ${user.email}`.red,
      emailError,
    );

    // Don't fail the signup - user is created, they can request resend
    res.status(200).json({
      success: true,
      message: 'Account created, but confirmation email could not be sent. Please use the resend confirmation option.',
      data: user,
    });
  }
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const login = expressAsyncHandler(async (req, res, next) => {
  // Sanitize and trim inputs
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const parentId = req.body.parentId?.trim();

  if (!email || !password) {
    return next(new createHttpError.BadRequest('Please provide an email and password'));
  }

  // Only fetch user data needed for authentication - don't populate unnecessary relations
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(createHttpError.Unauthorized('Invalid email or password'));
  }

  // Check email confirmation (skip for tethered children)
  const isTetheredChild = user.isTetheredChild || !user.email;
  if (!isTetheredChild && !user.emailConfirmed) {
    return next(createHttpError.Unauthorized('Please confirm your email before logging in'));
  }

  if (parentId) {
    const res = await createUserParentsConnections(user, parentId);
    if (!res) {
      return next(new createHttpError.BadRequest('Parent not found'));
    }
  }

  const token = {
    name: 'token',
    value: hashAndTokens.generatePasswordToken({ id: user._id }),
  };

  setTokenCookie(token, res);

  // Return user data without sensitive fields (password already excluded by model transform)
  // Fetch fresh user data without password field to ensure clean response
  const userData = await User.findById(user._id).select(EXCLUDED_FIELDS);

  res.status(200).json({
    success: true,
    data: userData,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = expressAsyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  if (!oldPassword || !newPassword) {
    return next(createHttpError.BadRequest('Both old and new passwords are required to change password'));
  }

  if (newPassword.length < 5 || newPassword.length > 30) {
    return next(
      createHttpError.BadRequest('A password must contain between 5 and 30 characters'),
    );
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatch) {
    return next(createHttpError.Unauthorized('Old password is incorrect'));
  }

  user.password = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUND, 10));

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully, you may log in now',
  });
});

// @desc    Request forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = expressAsyncHandler(async (req, res, next) => {
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
  user.resetPasswordExpire = Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRES_I || '3600000', 10); // Default 1 hour

  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: generateHtmlMessage({ user, resetURL }),
    text: generateTextMessage({ user, resetURL }),
  });

  res.status(200).json({
    success: true,
    message: 'Reset password email sent',
  });
});

// @desc    Request reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  const resetPasswordToken = hashAndTokens.hashToken(req.params.resetToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(createHttpError.Unauthorized('Invalid token'));
  }

  // Hash the new password before saving
  user.password = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUND, 10));
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully. You may log in now',
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = expressAsyncHandler(async (req, res, next) => {
  removeCookie('token', res);
  removeCookie('childToken', res);

  res.status(200).json({
    success: true,
    message: 'User logged out',
  });
});

// @desc    Confirm email
// @route   GET /api/auth/confirm-email/:token
// @access  Public
export const confirmEmail = expressAsyncHandler(async (req, res, next) => {
  const confirmationToken = hashAndTokens.hashToken(req.params.token);
  const MAX_RESEND_COUNT = 3;

  const user = await User.findOne({
    emailConfirmationToken: confirmationToken,
    emailConfirmationExpire: { $gt: Date.now() },
  });

  // Handle already confirmed (idempotent) - return success
  if (!user) {
    // Check if token is expired or invalid - use delay for timing attack prevention
    await delay(2000 + Math.random() * 2000);
    return next(createHttpError.Unauthorized('Invalid or expired confirmation token'));
  }

  // If already confirmed, return success (idempotent)
  if (user.emailConfirmed) {
    return res.status(200).json({
      success: true,
      message: 'Email already confirmed. You can log in now.',
    });
  }

  // Check if max resend count reached - prevent confirmation even with valid token
  const resendCount = user.emailConfirmationResendCount || 0;
  if (resendCount >= MAX_RESEND_COUNT) {
    // Log security event
    console.error(
      `[SECURITY] Email confirmation attempted after max resends for user: ${user._id}, email: ${user.email}, IP: ${req.ip || 'unknown'}`.red,
    );

    // Invalidate token
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpire = undefined;
    await user.save();

    return next(
      createHttpError.Forbidden(
        'Maximum number of confirmation email resends reached. Please contact support for assistance.',
      ),
    );
  }

  // Confirm email and clear token (single-use)
  user.emailConfirmed = true;
  user.emailConfirmationToken = undefined;
  user.emailConfirmationExpire = undefined;
  // Reset resend count and cooldown on successful confirmation
  user.emailConfirmationResendCount = 0;
  user.emailConfirmationResendCooldown = undefined;

  await user.save();

  // Log successful confirmation
  console.log(`[INFO] Email confirmed successfully for user: ${user._id}, email: ${user.email}`.green);

  res.status(200).json({
    success: true,
    message: 'Email confirmed successfully. You can now log in.',
  });
});

// @desc    Resend email confirmation
// @route   POST /api/auth/resend-confirmation
// @access  Public
export const resendConfirmation = expressAsyncHandler(async (req, res, next) => {
  // Sanitize and trim email input
  const email = req.body.email?.trim().toLowerCase();
  const MAX_RESEND_COUNT = 5;
  // Cooldown period: 15 minutes (900000 ms) - can be configured via env var
  const RESEND_COOLDOWN_MS = parseInt(process.env.EMAIL_CONFIRMATION_RESEND_COOLDOWN_MS || '900000', 10);

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

  // Check cooldown period - must wait before resending
  const now = Date.now();
  const lastResendTime = user.emailConfirmationResendCooldown
    ? new Date(user.emailConfirmationResendCooldown).getTime()
    : 0;
  const timeSinceLastResend = now - lastResendTime;

  if (lastResendTime > 0 && timeSinceLastResend < RESEND_COOLDOWN_MS) {
    const remainingCooldownMs = RESEND_COOLDOWN_MS - timeSinceLastResend;
    const remainingCooldownSeconds = Math.ceil(remainingCooldownMs / 1000);
    const remainingMinutes = Math.floor(remainingCooldownSeconds / 60);
    const remainingSeconds = remainingCooldownSeconds % 60;

    // Log cooldown violation
    console.error(
      `[SECURITY] Email confirmation resend cooldown violation for user: ${user._id}, email: ${user.email}, IP: ${req.ip || 'unknown'}, remaining: ${remainingCooldownSeconds} seconds`.red,
    );

    // Show precise time remaining
    let timeMessage;
    if (remainingMinutes > 0) {
      timeMessage = remainingSeconds > 0
        ? `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
        : `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    } else {
      timeMessage = `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }

    const error = createHttpError.TooManyRequests(
      `Please wait ${timeMessage} before requesting another confirmation email.`,
    );
    // Attach cooldown time in milliseconds to the error for UI countdown
    error.cooldownRemainingMs = remainingCooldownMs;
    return next(error);
  }

  // Check if max resend count reached
  const currentResendCount = user.emailConfirmationResendCount || 0;
  if (currentResendCount >= MAX_RESEND_COUNT) {
    // Log security event
    console.error(
      `[SECURITY] Email confirmation resend limit exceeded for user: ${user._id}, email: ${user.email}, IP: ${req.ip || 'unknown'}`.red,
    );

    // Invalidate existing token to prevent confirmation
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpire = undefined;
    await user.save();

    return next(
      createHttpError.Forbidden(
        'Maximum number of confirmation email resends reached. Please contact support for assistance.',
      ),
    );
  }

  // Generate token first (before any DB updates)
  const confirmationToken = hashAndTokens.generateResetPasswordToken();
  const hashedToken = hashAndTokens.hashToken(confirmationToken);
  const tokenExpire = Date.now() + parseInt(process.env.EMAIL_CONFIRMATION_EXPIRES_I || '86400000', 10);

  // Check count one more time before attempting to send email
  const currentResendCountCheck = user.emailConfirmationResendCount || 0;
  if (currentResendCountCheck >= MAX_RESEND_COUNT) {
    console.error(
      `[SECURITY] Email confirmation resend limit exceeded (race condition detected) for user: ${user._id}, email: ${user.email}, IP: ${req.ip || 'unknown'}`.red,
    );
    return next(
      createHttpError.Forbidden(
        'Maximum number of confirmation email resends reached. Please contact support for assistance.',
      ),
    );
  }

  const confirmationURL = `${process.env.CLIENT_URL}/confirm-email/${confirmationToken}`;

  // Try to send email FIRST - only increment count and set cooldown if email succeeds
  try {
    await sendEmail({
      to: user.email,
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

    // If update failed (count was already at max), log but don't fail since email was sent
    if (!updateResult) {
      console.error(
        `[WARNING] Email sent but count update failed (race condition) for user: ${user._id}, email: ${user.email}`.yellow,
      );
      // Still return success since email was sent
    } else {
      // Log successful resend attempt
      console.log(
        `[INFO] Email confirmation resent for user: ${user._id}, email: ${user.email}, resend count: ${updateResult.emailConfirmationResendCount}`.yellow,
      );
    }

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent. Please check your inbox.',
    });
  } catch (emailError) {
    // Log email sending error
    console.error(
      `[ERROR] Failed to send confirmation email for user: ${user._id}, email: ${user.email}`.red,
      emailError,
    );

    // Email failed - do NOT increment count or set cooldown
    // User can retry immediately without penalty
    return next(createHttpError.InternalServerError('Failed to send confirmation email. Please try again later.'));
  }
});
