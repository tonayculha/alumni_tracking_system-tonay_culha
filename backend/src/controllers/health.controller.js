const healthService = require('../services/health.service');

const getHealth = async (req, res, next) => {
  try {
    const health = await healthService.getHealthStatus();
    return res.status(200).json(health);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
};
