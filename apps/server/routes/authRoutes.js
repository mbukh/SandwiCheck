import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { ROLE } from '../constants/usersConstants.js';
import { createChildUser, getSession, loginChildUser, switchToParent } from '../controllers/authChildController.js';
import {
  changePassword,
  confirmEmail,
  forgotPassword,
  login,
  logout,
  resendConfirmation,
  resetPassword,
  signup,
} from '../controllers/authController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Rate limiter for resend confirmation (stricter than general API rate limit)
const resendConfirmationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: 'Too many confirmation email requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Log rate limit violation (PII will be automatically masked)
    logger.warn('Rate limit exceeded for resend confirmation', {
      requestId: req.requestId,
      ip: req.ip || 'unknown',
    });

    res.status(429).json({
      success: false,
      error: {
        status: 429,
        message: 'Too many confirmation email requests, please try again later',
      },
    });
  },
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/session', protect, getSession);

router.get('/confirm-email/:token', confirmEmail);
router.post('/resend-confirmation', resendConfirmationRateLimit, resendConfirmation);

router.post('/create-child', protect, authorize(ROLE.parent), createChildUser);
router.post('/login-child', protect, authorize(ROLE.parent), loginChildUser);
router.post('/switch-to-parent', protect, authorize(ROLE.child), switchToParent);

router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

router.post('/logout', protect, logout);

export default router;
