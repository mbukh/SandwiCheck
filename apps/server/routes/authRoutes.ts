import express from 'express';
import { ROLE } from '@sandwicheck/shared';
import {
  createChildUser,
  createInvite,
  getSession,
  loginChildUser,
  switchToParent,
} from '#controllers/authChildController.ts';
import {
  changePassword,
  confirmEmail,
  forgotPassword,
  login,
  logout,
  resendConfirmation,
  resetPassword,
  signup,
} from '#controllers/authController.ts';
import { authorize, protect } from '#middleware/authMiddleware.ts';
import { createRateLimit } from '#middleware/rateLimit.ts';

const router = express.Router();

/*
 * Per-IP rate limiters for sensitive auth endpoints, stricter than the global API
 * limiter, to blunt credential-stuffing / signup & email-flooding abuse. See
 * middleware/rateLimit.ts for the shared factory and the trust-proxy / NAT notes.
 */
const resendConfirmationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many confirmation email requests, please try again later',
});

const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many login attempts, please try again later',
});

const signupRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: 'Too many sign-up attempts, please try again later',
});

const forgotPasswordRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many password reset requests, please try again later',
});

// Token-gated endpoints (email confirmation, password reset) — defense-in-depth atop the high-entropy tokens.
const tokenVerificationRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many attempts, please try again later',
});

router.post('/signup', signupRateLimit, signup);
router.post('/login', loginRateLimit, login);
router.get('/session', protect, getSession);

router.get('/confirm-email/:token', tokenVerificationRateLimit, confirmEmail);
router.post('/resend-confirmation', resendConfirmationRateLimit, resendConfirmation);

router.post('/create-child', protect, authorize(ROLE.parent), createChildUser);
router.post('/create-invite', protect, authorize(ROLE.parent), createInvite);
router.post('/login-child', protect, authorize(ROLE.parent), loginChildUser);
router.post('/switch-to-parent', protect, authorize(ROLE.child), switchToParent);

router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPasswordRateLimit, forgotPassword);
router.put('/reset-password/:resetToken', tokenVerificationRateLimit, resetPassword);

router.post('/logout', protect, logout);

export default router;
