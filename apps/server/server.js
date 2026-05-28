import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { CLIENT_DIR, UPLOADS_DIR } from './config/dir.js';
import errorHandler from './middleware/errorHandler.js';
import requestIdMiddleware from './middleware/requestIdMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import ingredientsRoutes from './routes/ingredientsRoutes.js';
import sandwichesRoutes from './routes/sandwichesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import logger, { getLoggerLevel, morganStream } from './utils/logger.js';

const app = express();

// Rate limiter
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: 'Too many requests, please try again later',
  }),
);
// CORS cross-domain access
app.use(
  cors({
    origin: (origin, callback) => {
      const isOriginAllowed = process.env.CLIENT_URL === origin || !origin;
      callback(null, process.env.NODE_ENV === 'local' || isOriginAllowed);
    },
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: '5kb' }));
// Cookies parser
app.use(cookieParser());

// ==== Request ID Middleware (for request tracing) ==== //
app.use(requestIdMiddleware);

/*
 * ==== HTTP Request Logging (debug level only) ==== //
 * Only log HTTP requests when LOG_LEVEL is 'debug'
 * SECURITY: Custom format to sanitize sensitive headers and URLs
 */
if (getLoggerLevel() === 'debug') {
  const nodeEnvironment = process.env.NODE_ENV || 'local';

  // Custom morgan format that sanitizes sensitive data
  const sanitizedFormat = (tokens, request, res) => {
    const method = tokens.method(request, res);
    const url = tokens.url(request, res);
    const status = tokens.status(request, res);
    const responseTime = tokens['response-time'](request, res);
    const remoteAddr = tokens['remote-addr'](request, res);
    // const userAgent = tokens['user-agent'](request, res);

    // Sanitize URL - remove tokens from query params and paths
    let sanitizedUrl = url;
    // Remove tokens from URL path (e.g., /confirm-email/TOKEN)
    sanitizedUrl = sanitizedUrl.replaceAll(/\/(confirm-email|reset-password|reset-password\/)[^/\s]+/gi, (match) => {
      const parts = match.split('/');
      if (parts.length > 0) {
        const lastPart = parts.at(-1);
        // If it looks like a token (long alphanumeric), mask it
        if (lastPart.length > 20 && /^[a-zA-Z0-9_-]+$/.test(lastPart)) {
          return `${parts.slice(0, -1).join('/')}/${lastPart.slice(0, 4)}***${lastPart.slice(Math.max(0, lastPart.length - 4))}`;
        }
      }
      return match;
    });
    // Remove tokens from query params
    sanitizedUrl = sanitizedUrl.replaceAll(/([?&])(token|resetToken|confirmationToken)=[^&\s]+/gi, '$1$2=***');

    const logMessage = `${sanitizedUrl} ${status} ${responseTime}ms`;
    if (nodeEnvironment === 'production') {
      return logMessage;
    }
    // Development: more details but still sanitized
    return `${method} ${logMessage} - ${remoteAddr}`;
  };

  app.use(morgan(sanitizedFormat, { stream: morganStream }));
}

/*
 * ==== Security ==== //
 * parse URL-encoded data received from the client
 */
app.use(express.urlencoded({ extended: true }));
// helmet: A middleware for securing Express apps by setting various HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }));
// xss-clean: A middleware for sanitizing user input (req.body, req.query, and req.params) to prevent XSS attacks
app.use(xss());
// hpp: A middleware for preventing HTTP Parameter Pollution attacks.
app.use(hpp());

// === Main routes === //
app.use('/api/v1/ingredients', ingredientsRoutes);
app.use('/api/v1/sandwiches', sandwichesRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// === Middleware === //
app.use(errorHandler);

/*
 * === Forward static content === //
 * Front-End
 */
app.use('/', express.static(CLIENT_DIR));
// Uploads folder
app.use('/uploads', express.static(UPLOADS_DIR));

// Start server
const PORT = process.env.PORT || 5001;

// Initialize database connection before starting server
let server;
try {
  await connectDB();
  server = app.listen(PORT, () => {
    const nodeEnvironment = process.env.NODE_ENV || 'local';
    logger.info('Server started', {
      environment: nodeEnvironment,
      port: PORT,
    });
  });
} catch (error) {
  logger.error('Failed to start server - MongoDB connection required', {
    error: {
      name: error.name,
      message: error.message,
    },
  });
  throw error;
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception - shutting down:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  // Give logger time to flush before exiting
  setTimeout(() => {
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error, _promise) => {
  logger.error('Unhandled Rejection - shutting down:', {
    message: error?.message || String(error),
    stack: error?.stack,
    name: error?.name,
  });
  // Give logger time to flush before exiting
  setTimeout(() => {
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }, 1000);
});
