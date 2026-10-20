/**
 * Async error wrapper for Express 4 route handlers and middleware.
 * Ensures unhandled promise rejections are passed to Express error-handling middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
