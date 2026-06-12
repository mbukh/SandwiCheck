import type { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';
import logger from '#utils/logger.ts';

interface AppError extends Error {
  status?: number;
  code?: string | number;
  value?: unknown;
  errors?: Record<string, { properties?: { message?: string } }>;
  cooldownRemainingMs?: number;
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Extract user ID if available (from auth middleware)
  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  /*
   * Logging - log error with context (requestId, userId, request details). Done first, before the
   * headersSent short-circuit below, so an error raised after the response already started is still
   * recorded instead of being silently dropped. Error object is automatically sanitized by logger.
   */
  logger.error('Request error', {
    requestId: req.requestId,
    userId,
    path: req.path,
    method: req.method,
    status: err.status || 500,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack,
    },
  });

  /*
   * If a response was already sent, delegate to Express's default handler instead of
   * writing a second time (which throws ERR_HTTP_HEADERS_SENT and can crash the request).
   */
  if (res.headersSent) {
    return next(err);
  }

  let error: AppError = { ...err, message: err.message, status: err.status };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id ending ...${String(err.value).slice(-6)} not found`;
    error = createHttpError.NotFound(message);
  }
  /*
   * Mongoose duplicate key — never reflect the offending field/value back to the client. The old
   * `Duplicate data {email: ...}` message was an enumeration oracle: any authenticated user could
   * probe arbitrary emails via a profile update. The duplicated value is still captured in the
   * logger.error call above for debugging.
   */
  if (err.code === 11_000) {
    error = createHttpError.BadRequest('A record with these details already exists');
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(error.errors ?? {})
      .map((val) => val.properties?.message)
      .join('; ');
    error = createHttpError.BadRequest(message);
  }

  // All multer upload errors are client problems (bad/oversized/unexpected file) → 400, not 500.
  if (err.name === 'MulterError') {
    error =
      error.code === 'LIMIT_FILE_SIZE'
        ? createHttpError(
            400,
            `The file is too large. The maximum file size allowed is ${Math.round(
              Number.parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTES ?? '', 10) / 1024 / 1024,
            )}MB`,
          )
        : createHttpError(400, `File upload error: ${err.message}`);
  }

  const finalStatus = error.status || 500;
  res.status(finalStatus);

  /*
   * Never return the internal message/code on a server error (5xx): unrecognized errors fall
   * through here carrying their raw err.message/err.code, which would leak implementation details.
   * The full detail is already captured in the logger.error call above. 4xx responses keep their
   * message and structured code (e.g. emailNotConfirmed) — the client keys UX on those.
   */
  const isServerError = finalStatus >= 500;

  const errorResponse: {
    success: boolean;
    error: {
      status?: number;
      message: string;
      cooldownRemainingMs?: number;
      code?: string | number;
    };
  } = {
    success: false,
    error: {
      status: error.status,
      message: isServerError ? 'Internal Server Error' : error.message || 'Server Error',
    },
  };

  // Include cooldown time if present (for email resend cooldown)
  if (error.cooldownRemainingMs !== undefined) {
    errorResponse.error.cooldownRemainingMs = error.cooldownRemainingMs;
  }

  // Include error code if present (4xx only — never expose an internal code on a 5xx)
  if (!isServerError && error.code !== undefined) {
    errorResponse.error.code = error.code;
  }

  res.json(errorResponse);
};

export default errorHandler;
