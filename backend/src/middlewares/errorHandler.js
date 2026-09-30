const logger = require('../utils/logger');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  if (config.env !== 'test') {
    if (statusCode >= 500) {
      logger.error('Unhandled server error caught by middleware', {
        error: err.message,
        stack: config.env === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
      });
    } else {
      logger.warn(`Client operational error [${statusCode}] on ${req.method} ${req.originalUrl}: ${err.message}`);
    }
  }

  // Always return structured JSON for /api endpoints or when JSON is requested
  if (req.originalUrl.startsWith('/api') || !req.accepts('html')) {
    return res.status(statusCode).json({
      status: 'error',
      error: err.name || 'InternalServerError',
      message: err.message || 'An unexpected error occurred on the server',
      ...(err.details ? { details: err.details } : {}),
      ...(config.env === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    });
  }

  return res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error ${statusCode} | Alumni System</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <main style="text-align: center; padding-top: 5rem;">
        <h1 style="font-size: 3.5rem; color: #ef4444;">Error ${statusCode}</h1>
        <h2>An unexpected error occurred</h2>
        <p style="color: #94a3b8; margin: 1rem 0 2rem;">${err.message || 'Internal Server Error'}</p>
        <a href="/home" class="btn btn-primary">Return to Home</a>
      </main>
    </body>
    </html>
  `);
};

module.exports = errorHandler;
