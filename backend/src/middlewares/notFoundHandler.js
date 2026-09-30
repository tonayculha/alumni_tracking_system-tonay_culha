const notFoundHandler = (req, res, next) => {
  // If request is under /api or client expects JSON, return JSON 404
  if (req.originalUrl.startsWith('/api') || !req.accepts('html')) {
    return res.status(404).json({
      status: 'error',
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 - Not Found | Alumni System</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <main style="text-align: center; padding-top: 5rem;">
        <h1 style="font-size: 4rem; color: #ef4444;">404</h1>
        <h2>Route Not Found</h2>
        <p style="color: #94a3b8; margin: 1rem 0 2rem;">The requested endpoint <code>${req.originalUrl}</code> does not exist.</p>
        <a href="/home" class="btn btn-primary">Return to Home</a>
      </main>
    </body>
    </html>
  `);
};

module.exports = notFoundHandler;
