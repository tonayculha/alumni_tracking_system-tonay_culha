/**
 * Standardized API response formatters
 */

const success = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    ...data,
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  const payload = {
    status: 'error',
    message,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  success,
  error,
};
