/**
 * Global error-handling middleware for Express.
 * Must be registered AFTER all routes.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Determine status code — use err.statusCode if set, otherwise 500
  const statusCode = err.statusCode || 500;

  // Log the error for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
