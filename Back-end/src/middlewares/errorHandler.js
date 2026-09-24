export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};
