export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

