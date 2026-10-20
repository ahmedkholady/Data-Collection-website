/**
 * Catch-all middleware for unhandled routes, returning a standard JSON 404 response.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFoundHandler;
