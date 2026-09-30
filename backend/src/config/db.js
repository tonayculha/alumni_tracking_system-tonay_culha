const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Non-blocking ping helper for health checks
const checkDatabaseHealth = async () => {
  try {
    const res = await pool.query('SELECT 1 AS status');
    return res.rows && res.rows[0].status === 1;
  } catch (error) {
    return false;
  }
};

module.exports = {
  pool,
  checkDatabaseHealth,
};
