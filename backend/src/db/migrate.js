const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Migration Runner
 * Executes all SQL migration scripts in src/db/migrations sequentially,
 * ensuring tables, constraints, and schema objects exist before the
 * application starts. Tracks applied migrations in `schema_migrations`.
 */
const runMigrations = async () => {
  const migrationsDir = path.resolve(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    logger.warn(`Migrations directory not found at ${migrationsDir}`);
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  logger.info(`Discovered ${files.length} database migration file(s) in sequence.`);

  const client = await pool.connect();
  try {
    // Ensure migrations ledger table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const file of files) {
      // Check if this migration version has already been executed
      const { rows } = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [file]
      );

      if (rows.length > 0) {
        logger.info(`Migration already executed, skipping: ${file}`);
        continue;
      }

      logger.info(`Applying migration in sequence: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        logger.info(`Migration applied and recorded successfully: ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        logger.error(`Migration transaction failed for ${file}`, {
          error: migrationErr.message,
          stack: migrationErr.stack,
        });
        throw migrationErr;
      }
    }

    logger.info('All database migrations completed successfully in sequence.');
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations()
    .then(async () => {
      logger.info('Migration process finished.');
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Migration failed', { error: err.message, stack: err.stack });
      await pool.end();
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
};
