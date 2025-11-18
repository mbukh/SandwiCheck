import createHttpError from 'http-errors';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, status: err.status };

  // Extract user ID if available (from auth middleware)
  const userId = req.user?._id?.toString() || req.user?.id?.toString();

  // Logging - log error with context (requestId, userId, request details)
  // Error object will be automatically sanitized by logger
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

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id ending ...${String(err.value).slice(-6)} not found`;
    error = createHttpError.NotFound(message);
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const match = error.message.match(/\{(.*)\}/g);
    const field_value = match ? match[0].replaceAll('"', '') : 'unknown field';
    const message = `Duplicate data ${field_value}`;
    error = createHttpError.BadRequest(message);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val) => val.properties?.message)
      .join('; ');
    error = createHttpError.BadRequest(message);
  }

  if (err.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      error = createHttpError(
        400,
        `The file is too large. The maximum file size allowed is ${Math.round(
          parseInt(process.env.MAX_UPLOAD_SIZE_IN_BYTE, 10) / 1024 / 1024,
        )}MB`,
      );
    }
  }

  res.status(error.status || 500);
  const errorResponse = {
    success: false,
    error: {
      status: error.status,
      message: error.message || 'Server Error',
    },
  };
  
  // Include cooldown time if present (for email resend cooldown)
  if (error.cooldownRemainingMs !== undefined) {
    errorResponse.error.cooldownRemainingMs = error.cooldownRemainingMs;
  }
  
  // Include error code if present (for distinguishing error types)
  if (error.code !== undefined) {
    errorResponse.error.code = error.code;
  }
  
  res.json(errorResponse);
};

export default errorHandler;
