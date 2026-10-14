const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to local backend/.env if present

const isTest = process.env.NODE_ENV === 'test';

// Resolve host: fallback alumni_postgres to 127.0.0.1 when running tests on host machine
const resolveDbHost = () => {
  if (process.env.TEST_DB_HOST) return process.env.TEST_DB_HOST;
  if (isTest && (process.env.DB_HOST === 'alumni_postgres' || !process.env.DB_HOST)) {
    return '127.0.0.1';
  }
  return process.env.DB_HOST || 'alumni_postgres';
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  appName: process.env.APP_NAME || 'Alumni Tracking System',
  db: {
    host: resolveDbHost(),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'alumni_user',
    password: process.env.DB_PASSWORD || 'alumni_secure_password',
    database: process.env.DB_NAME || 'alumni_db',
  },
};

module.exports = config;
