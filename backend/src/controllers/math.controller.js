const mathService = require('../services/math.service');
const { success, error } = require('../utils/responseFormatter');

const getSum = (req, res, next) => {
  try {
    const { number1, number2 } = req.params;
    const calcResult = mathService.calculateSum(number1, number2);

    if (!calcResult.success) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid input',
        message: 'Both number1 and number2 must be valid numeric values.',
        details: calcResult.errors,
        received: calcResult.received,
      });
    }

    return success(res, {
      operation: calcResult.operation,
      number1: calcResult.number1,
      number2: calcResult.number2,
      result: calcResult.result,
    }, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSum,
};
