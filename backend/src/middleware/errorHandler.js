export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
  });
}
