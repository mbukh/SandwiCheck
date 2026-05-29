/* eslint-disable no-console */
import crypto from 'node:crypto';
import { inspect } from 'node:util';
import winston from 'winston';

// Get log level from environment variable, default to 'info'
const getLogLevel = (): string => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels = ['error', 'warn', 'info', 'debug'];

  if (envLevel && validLevels.includes(envLevel)) {
    return envLevel;
  }

  return 'info';
};

/*
 * Determine format based on environment
 * Supports: 'local', 'development', 'production'
 * 'local' = local development (colored, human-readable) - default if NODE_ENV not set
 * 'development' = dev/staging server (JSON format)
 * 'production' = production server (JSON format)
 */
const nodeEnv = process.env.NODE_ENV || 'local';
const isLocal = nodeEnv === 'local';
const isProduction = nodeEnv === 'production';

// Security: Sanitize sensitive data from logs
const sanitizeData = (data: unknown, depth = 0, maxDepth = 5): unknown => {
  if (depth > maxDepth) return '[Max Depth Reached]';
  if (data === null || data === undefined) return data;

  // Handle primitives
  if (typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1, maxDepth));
  }

  // Handle Error objects
  if (data instanceof Error) {
    const err = data as Error & { code?: unknown; status?: unknown };
    const sanitized: Record<string, unknown> = {
      name: err.name,
      message: err.message,
    };

    // Only include stack in non-production or if explicitly enabled
    if (!isProduction || process.env.LOG_STACK_TRACES === 'true') {
      // Limit stack trace depth in production
      if (isProduction && err.stack) {
        const lines = err.stack.split('\n');
        sanitized.stack = lines.slice(0, 10).join('\n'); // First 10 lines only
      } else {
        sanitized.stack = err.stack;
      }
    }

    // Include error code if present
    if (err.code) sanitized.code = err.code;
    if (err.status) sanitized.status = err.status;

    return sanitized;
  }

  // Handle plain objects
  const sanitized: Record<string, unknown> = {};

  /*
   * Pre-compute sensitive key patterns for efficiency (created once, reused)
   * Use Set for O(1) lookup instead of array.some() which is O(n)
   */
  const sensitiveKeyPatterns = new Set([
    'password',
    'passwordhash',
    'token',
    'secret',
    'apikey',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'accesstoken',
    'refreshtoken',
    'emailconfirmationtoken',
    'resetpasswordtoken',
    'email',
    'emailaddress',
    'mongouri',
    'mongo_uri',
    'database',
    'connectionstring',
    'connection_string',
    'mailpassword',
    'mail_password',
    'jwtsecret',
    'jwt_secret',
  ]);

  // Check if key contains any sensitive pattern (optimized)
  const isSensitiveKey = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    for (const pattern of sensitiveKeyPatterns) {
      if (lowerKey.includes(pattern)) return true;
    }
    return false;
  };

  for (const [key, value] of Object.entries(data)) {
    // Mask sensitive fields
    if (isSensitiveKey(key)) {
      if (typeof value === 'string' && value.length > 0) {
        const lowerKey = key.toLowerCase();
        // Mask email addresses (keep first 2 chars and domain)
        if (lowerKey.includes('email') && value.includes('@')) {
          const atIndex = value.indexOf('@');
          sanitized[key] =
            `${value.slice(0, Math.max(0, Math.min(2, atIndex)))}***@${value.slice(Math.max(0, atIndex + 1))}`;
        } else {
          // Mask other sensitive values (show first 2 and last 2 chars)
          sanitized[key] =
            value.length > 4 ? `${value.slice(0, 2)}***${value.slice(Math.max(0, value.length - 2))}` : '***';
        }
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value, depth + 1, maxDepth);
    }
  }

  return sanitized;
};

/*
 * Mask PII in strings (emails, tokens, etc.)
 * OPTIMIZATION: Use compiled regex for better performance
 */
const EMAIL_REGEX = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const TOKEN_REGEX = /([a-zA-Z0-9_-]{20,})/g;

const maskPII = (text: unknown): unknown => {
  if (typeof text !== 'string' || text.length === 0) return text;

  // Early exit if no @ symbol (likely no email)
  if (!text.includes('@') && text.length < 20) return text;

  let result = text;

  // Mask email addresses (only if @ present)
  if (result.includes('@')) {
    result = result.replaceAll(EMAIL_REGEX, (_match: string, local: string, domain: string) => {
      return `${local.slice(0, Math.max(0, Math.min(2, local.length)))}***@${domain}`;
    });
  }

  // Mask long tokens (JWT-like strings) - only if string is long enough
  if (result.length >= 20) {
    result = result.replaceAll(TOKEN_REGEX, (match: string) => {
      if (match.length > 20) {
        return `${match.slice(0, 4)}***${match.slice(Math.max(0, match.length - 4))}`;
      }
      return match;
    });
  }

  return result;
};

// Sanitize file paths in stack traces (remove absolute paths in production)
const sanitizeStack = (stack: unknown): unknown => {
  if (!stack || !isProduction || typeof stack !== 'string') return stack;

  // Remove absolute paths, keep only filename and line number
  return stack.replaceAll(/\/[^\s]+/g, (match) => {
    const parts = match.split('/');
    return parts.length > 1 ? `/${parts.at(-1)}` : match;
  });
};

// Local format: human-readable with enhanced colors and formatting
const localFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, requestId, userId, ...rest } = info as winston.Logform.TransformableInfo &
      Record<string, unknown>;

    // Extract level name from colorized level string (remove ANSI codes and get base level)
    const levelMatch = typeof level === 'string' ? level.match(/[a-z]+/i) : null;
    const levelName = levelMatch ? levelMatch[0].toLowerCase() : 'info';

    // Color-coded level indicators with emojis
    const levelSymbols: Record<string, string> = {
      error: '❌',
      warn: '⚠️ ',
      info: 'ℹ️ ',
      debug: '🔍',
    };
    const symbol = levelSymbols[levelName] || '•';

    // Build context prefix (requestId, userId)
    const contextParts: string[] = [];
    if (requestId) contextParts.push(`[req:${String(requestId).slice(0, 8)}]`);
    if (userId) contextParts.push(`[user:${userId}]`);
    const contextPrefix = contextParts.length > 0 ? contextParts.join(' ') + ' ' : '';

    // Format message with better structure
    let output = `${timestamp} ${symbol} ${level}: ${contextPrefix}`;

    // Handle different message types
    if (stack) {
      // Error with stack trace - no sanitization needed for local
      output += `${message}\n${stack}`;
    } else if (typeof message === 'object' && message !== null) {
      // Object message - pretty print with colors
      output +=
        '\n' +
        inspect(message, {
          colors: true,
          depth: null,
          maxArrayLength: null,
          maxStringLength: null,
          compact: false,
          sorted: false,
        });
    } else {
      // String message
      output += message;
    }

    /*
     * Add any additional metadata fields (excluding standard Winston fields)
     * OPTIMIZATION: Use Set for O(1) lookup instead of array.includes()
     */
    const standardFields = new Set([
      'timestamp',
      'level',
      'message',
      'stack',
      'splat',
      'symbol',
      'requestId',
      'userId',
    ]);
    const metaFields: string[] = [];
    for (const key in rest) {
      if (!standardFields.has(key) && rest[key] !== undefined) {
        metaFields.push(key);
      }
    }
    if (metaFields.length > 0) {
      const meta: Record<string, unknown> = {};
      for (const key of metaFields) {
        meta[key] = rest[key];
      }
      output +=
        '\n' +
        inspect(meta, {
          colors: true,
          depth: null,
          maxArrayLength: null,
          maxStringLength: null,
          compact: false,
          sorted: false,
        });
    }

    return output;
  }),
);

// Development/Production format: JSON for log aggregation
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format((info) => {
    // Sanitize all data in production
    const sanitized = { ...info } as Record<string, unknown>;

    // Sanitize message
    if (sanitized.message) {
      sanitized.message =
        typeof sanitized.message === 'string' ? maskPII(sanitized.message) : sanitizeData(sanitized.message);
    }

    // Sanitize stack trace
    if (sanitized.stack) {
      sanitized.stack = sanitizeStack(sanitized.stack);
      // Limit stack depth in production unless explicitly enabled
      if (process.env.LOG_STACK_TRACES !== 'true' && typeof sanitized.stack === 'string') {
        const lines = sanitized.stack.split('\n');
        sanitized.stack = lines.slice(0, 10).join('\n');
      }
    }

    // Sanitize all other fields (optimized: use Set for O(1) lookup)
    const protectedFields = new Set(['timestamp', 'level', 'message', 'stack', 'requestId', 'userId']);
    for (const key in sanitized) {
      if (!protectedFields.has(key)) {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    }

    // Add standard metadata
    sanitized.service = 'sandwicheck-server';
    sanitized.environment = nodeEnv;

    return sanitized as winston.Logform.TransformableInfo;
  })(),
  winston.format.json(),
);

// Create logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  format: isLocal ? localFormat : jsonFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  // Prevent logger from exiting on error
  exitOnError: false,
});

/*
 * Helper to process log arguments and add context
 * OPTIMIZATION: Minimize object creation and property deletion
 */
const processLogArgs = (
  args: unknown[],
  defaultContext: Record<string, unknown> = {},
): {
  message: string;
  context: Record<string, unknown>;
  error: Error | null;
  meta: Record<string, unknown>;
} => {
  // Early exit for empty args
  if (args.length === 0) {
    return {
      message: '',
      context: defaultContext,
      error: null as Error | null,
      meta: {},
    };
  }

  let message = '';
  let error: Error | null = null;
  let meta: Record<string, unknown> = {};
  const context: Record<string, unknown> = { ...defaultContext };

  const arg0 = args[0];
  const arg1 = args[1];

  // Pattern 1: logger.info('message', { meta }) or logger.info('message', Error)
  if (typeof arg0 === 'string') {
    message = arg0;
    if (arg1) {
      if (arg1 instanceof Error) {
        error = arg1;
        if (args.length > 2 && typeof args[2] === 'object' && args[2] !== null) {
          meta = args[2] as Record<string, unknown>;
        }
      } else if (typeof arg1 === 'object' && arg1 !== null) {
        meta = arg1 as Record<string, unknown>;
      }
    }
  }
  // Pattern 2: logger.info({ message: '...', ...meta }) or logger.info(Error)
  else if (typeof arg0 === 'object' && arg0 !== null) {
    if (arg0 instanceof Error) {
      error = arg0;
      message = error.message;
      if (arg1 && typeof arg1 === 'object' && arg1 !== null) {
        meta = arg1 as Record<string, unknown>;
      }
    } else {
      // Extract message and rest as meta (avoid delete operation)
      const { message: msg, requestId, userId, ...rest } = arg0 as Record<string, unknown>;
      message = (msg as string) || '';
      meta = rest;

      // Extract context fields directly (avoid delete)
      if (requestId) context.requestId = requestId;
      if (userId) context.userId = userId;
    }
  }

  // Extract context from meta if not already extracted (avoid delete operations)
  if (meta.requestId && !context.requestId) {
    context.requestId = meta.requestId;

    const { _requestId, ...rest } = meta;
    meta = rest;
  }
  if (meta.userId && !context.userId) {
    context.userId = meta.userId;

    const { _userId, ...rest } = meta;
    meta = rest;
  }

  return { message, context, error, meta };
};

// Wrap logger methods in try-catch for safety with enhanced context support
const safeLogger = {
  error: (...args: unknown[]) => {
    try {
      const { message, context, error, meta } = processLogArgs(args);
      const logData = {
        ...context,
        ...meta,
      };

      if (error) {
        logData.error = error;
        if (message) {
          logger.error(message, logData);
        } else {
          logger.error(logData);
        }
      } else if (message) {
        logger.error(message, logData);
      } else {
        logger.error(logData);
      }
    } catch (error) {
      // Fallback to console if logger fails - but sanitize output
      console.error('[Logger Error]', error instanceof Error ? error.message : error);
      if (!isProduction) {
        console.error(...args);
      }
    }
  },
  warn: (...args: unknown[]) => {
    try {
      const { message, context, error, meta } = processLogArgs(args);
      const logData = {
        ...context,
        ...meta,
      };

      if (error) {
        logData.error = error;
        if (message) {
          logger.warn(message, logData);
        } else {
          logger.warn(logData);
        }
      } else if (message) {
        logger.warn(message, logData);
      } else {
        logger.warn(logData);
      }
    } catch (error) {
      console.error('[Logger Error]', error instanceof Error ? error.message : error);
      if (!isProduction) {
        console.warn(...args);
      }
    }
  },
  info: (...args: unknown[]) => {
    try {
      const { message, context, error, meta } = processLogArgs(args);
      const logData = {
        ...context,
        ...meta,
      };

      if (error) {
        logData.error = error;
        if (message) {
          logger.info(message, logData);
        } else {
          logger.info(logData);
        }
      } else if (message) {
        logger.info(message, logData);
      } else {
        logger.info(logData);
      }
    } catch (error) {
      console.error('[Logger Error]', error instanceof Error ? error.message : error);
      if (!isProduction) {
        console.info(...args);
      }
    }
  },
  debug: (...args: unknown[]) => {
    try {
      const { message, context, error, meta } = processLogArgs(args);
      const logData = {
        ...context,
        ...meta,
      };

      if (error) {
        logData.error = error;
        if (message) {
          logger.debug(message, logData);
        } else {
          logger.debug(logData);
        }
      } else if (message) {
        logger.debug(message, logData);
      } else {
        logger.debug(logData);
      }
    } catch (error) {
      console.error('[Logger Error]', error instanceof Error ? error.message : error);
      if (!isProduction) {
        console.debug(...args);
      }
    }
  },
};

/*
 * Morgan stream for HTTP request logging at debug level
 * SECURITY: Sanitize any remaining sensitive data in morgan output
 */
export const morganStream = {
  write: (message: string) => {
    try {
      // Remove trailing newline from morgan output
      let trimmedMessage = message.trim();

      /*
       * Additional sanitization: mask any remaining tokens/secrets in the log line
       * This is a safety net in case morgan format missed something
       */
      if (trimmedMessage) {
        // Mask JWT-like tokens (long base64-like strings)
        trimmedMessage = maskPII(trimmedMessage) as string;

        safeLogger.debug(trimmedMessage);
      }
    } catch (error) {
      /*
       * Silently fail to prevent morgan stream errors from crashing the app
       * This is a fallback - morgan stream errors should be rare
       */
      console.error('[Morgan Stream Error]', error instanceof Error ? error.message : error);
    }
  },
};

// Export logger level getter for conditional checks (must be after logger creation)
export const getLoggerLevel = (): string => logger.level;

/*
 * Export utility functions for use in middleware/controllers
 * OPTIMIZATION: Use crypto.randomBytes for cryptographically secure IDs
 * 8 bytes = 16 hex characters, sufficient for uniqueness and performance
 */
export const generateRequestId = (): string => crypto.randomBytes(8).toString('hex');

// Export sanitization utilities for external use if needed
export { maskPII, sanitizeData };

export default safeLogger;
