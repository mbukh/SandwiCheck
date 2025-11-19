import { generateRequestId } from '../utils/logger.js';

/**
 * Request ID Middleware
 * Generates a unique request ID for each request and attaches it to req.requestId
 * This enables request tracing across the application
 *
 * OPTIMIZATION: Minimal overhead - only header lookup and ID generation when needed
 */
const requestIdMiddleware = (req, res, next) => {
  // OPTIMIZATION: Check header first (most requests will have it in distributed systems)
  // Use existing request ID from header (for distributed tracing) or generate new one
  const existingId = req.headers['x-request-id'];
  req.requestId = existingId || generateRequestId();

  // Add request ID to response headers for client correlation
  // OPTIMIZATION: Only set if different from existing (though usually we want to set it)
  res.setHeader('X-Request-ID', req.requestId);

  next();
};

export default requestIdMiddleware;
