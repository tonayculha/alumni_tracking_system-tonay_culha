const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Migration Runner
 * Executes all SQL migration scripts in src/db/migrations ensuring
 * tables and schema objects exist before application starts.
 */
const runMigrations = async () => {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  logger.info(`Running ${files.length} database migration(s)...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    logger.info(`Applying migration: ${file}`);
    await query(sql);
    logger.info(`Migration applied successfully: ${file}`);
  }

  logger.info('All database migrations completed successfully.');
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
