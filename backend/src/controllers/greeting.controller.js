const greetingService = require('../services/greeting.service');
const { success } = require('../utils/responseFormatter');

const getGreeting = (req, res, next) => {
  try {
    const { name } = req.params;
    const greetingData = greetingService.formatGreeting(name);
    return success(res, greetingData, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGreeting,
};
