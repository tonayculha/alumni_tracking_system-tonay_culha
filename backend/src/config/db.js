const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * PostgreSQL Connection Pool
 * Configured with enterprise pooling limits, idle client timeout,
 * and lifecycle error handlers.
 */
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20, // Maximum active clients in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Fail fast if connection cannot be established
});

// Pool error handling for idle clients
pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client in pool', {
    error: err.message,
    stack: err.stack,
  });
});

/**
 * Clean parameterized query helper
 * @param {string} text - SQL query text
 * @param {Array<any>} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Non-blocking health probe for readiness/liveness checks
 * @returns {Promise<boolean>}
 */
const checkDatabaseHealth = async () => {
  try {
    const res = await pool.query('SELECT 1 AS status');
    return res.rows && res.rows.length > 0 && res.rows[0].status === 1;
  } catch (error) {
    logger.warn('Database health check probe failed', { error: error.message });
    return false;
  }
};

/**
 * Close all pool connections (for graceful shutdown or test teardown)
 */
const closePool = async () => {
  await pool.end();
};

module.exports = {
  pool,
  query,
  checkDatabaseHealth,
  closePool,
};
