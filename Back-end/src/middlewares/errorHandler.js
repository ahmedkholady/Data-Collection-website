import { env } from '../config/env.js';

/**
 * Centralized error handling middleware.
 * Formats errors consistently as JSON and prevents leaking internal stack traces in production.
 */
export const errorHandler = (err, req, res, next) => {
  // Determine appropriate HTTP status code
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Handle specific Express / Body-Parser errors
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    err.message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    err.message = 'Request payload too large';
  }

  const isProduction = (process.env.NODE_ENV || env.NODE_ENV) === 'production';

  // For unhandled 500 internal errors in production, conceal raw server error details
  const message =
    isProduction && statusCode === 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  const responsePayload = {
    status: 'error',
    message,
  };

  // Attach validation errors / details if available
  if (err.details) {
    responsePayload.errors = err.details;
  }

  // Include stack trace only in non-production environments
  if (!isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  // Log non-operational or 500 errors to stderr
  if (!err.isOperational || statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
