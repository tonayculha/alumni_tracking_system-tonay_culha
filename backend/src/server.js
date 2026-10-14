const app = require('./app');
const config = require('./config/env');
const { pool } = require('./config/db');
const { runMigrations } = require('./db/migrate');
const { runSeeds } = require('./db/seed');
const logger = require('./utils/logger');

let server;

/**
 * Boots the application with automated pre-flight database migrations
 * and idempotent initial seed checks before opening the HTTP port.
 */
const startServer = async () => {
  try {
    logger.info('Performing automated database migration & schema check...');
    await runMigrations();
    await runSeeds();

    server = app.listen(config.port, config.host, () => {
      logger.info(`🚀 ${config.appName} started successfully`, {
        port: config.port,
        host: config.host,
        environment: config.env,
        url: `http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`,
      });
    });
  } catch (err) {
    logger.error('Fatal: Failed to start server during database initialization', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

// Graceful Shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (!server) {
    pool.end().finally(() => process.exit(0));
    return;
  }

  server.close(async () => {
    logger.info('HTTP server closed. Releasing active database connections...');
    try {
      await pool.end();
      logger.info('Database pool drained successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing database pool during shutdown', { error: err.message });
      process.exit(1);
    }
  });

  // Force shutdown after 10s timeout if hung
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded (10s). Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason: reason instanceof Error ? reason.stack : reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown', { error: err.stack });
  gracefulShutdown('uncaughtException');
});

startServer();

module.exports = server;
