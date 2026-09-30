const os = require('os');
const { checkDatabaseHealth } = require('../config/db');
const config = require('../config/env');

const startTime = Date.now();

const getHealthStatus = async () => {
  const uptimeSeconds = Math.floor(process.uptime());
  const dbConnected = await checkDatabaseHealth();

  return {
    status: 'ok',
    service: config.appName,
    environment: config.env,
    uptime: uptimeSeconds,
    uptimeHuman: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    database: {
      connected: dbConnected,
    },
  };
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}

module.exports = {
  getHealthStatus,
};
