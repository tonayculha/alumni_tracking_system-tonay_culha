const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/db');
const logger = require('../utils/logger');
const { jobPostingFactory } = require('./factories/jobPostingFactory');

/**
 * Seed Runner
 * Executes idempotent SQL seed scripts in src/db/seeds to populate
 * initial data for users and announcements.
 */
const runSeeds = async () => {
  const seedsDir = path.resolve(__dirname, 'seeds');
  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  logger.info(`Running ${files.length} database seed script(s)...`);

  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    logger.info(`Executing seed: ${file}`);
    await query(sql);
    logger.info(`Seed applied successfully: ${file}`);
  }

  // Seed job postings linked to registered users via jobPostingFactory
  logger.info('Seeding job postings via jobPostingFactory...');
  const seededJobs = await jobPostingFactory.seed();
  logger.info(`Seeded ${seededJobs.length} job postings successfully.`);

  logger.info('All database seeds completed successfully.');
};

if (require.main === module) {
  runSeeds()
    .then(async () => {
      logger.info('Seed process finished.');
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Seed execution failed', { error: err.message, stack: err.stack });
      await pool.end();
      process.exit(1);
    });
}

module.exports = {
  runSeeds,
};
