/**
 * Math Service
 * Strict validation and numerical calculations
 */

/**
 * Validates whether a given string is a strictly valid finite number.
 * Rejects whitespace-only, empty, alphanumeric strings like "12abc", hex if unwanted, etc.
 * Accepts: "10", "-5", "3.14", "-0.75"
 */
const parseStrictNumber = (val) => {
  if (val === undefined || val === null) {
    return { valid: false, value: null };
  }

  const trimmed = String(val).trim();
  if (trimmed === '') {
    return { valid: false, value: null };
  }

  // Strict regex for optional sign, digits, and optional decimal point with digits
  const isNumericRegex = /^[-+]?(\d+(\.\d+)?|\.\d+)$/;
  if (!isNumericRegex.test(trimmed)) {
    return { valid: false, value: null };
  }

  const num = Number(trimmed);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, value: null };
  }

  return { valid: true, value: num };
};

const calculateSum = (num1Str, num2Str) => {
  const parsed1 = parseStrictNumber(num1Str);
  const parsed2 = parseStrictNumber(num2Str);

  const errors = [];
  if (!parsed1.valid) {
    errors.push(`'${num1Str}' is not a valid number`);
  }
  if (!parsed2.valid) {
    errors.push(`'${num2Str}' is not a valid number`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      received: {
        number1: num1Str,
        number2: num2Str,
      },
    };
  }

  // Floating point precision handling: round to max 10 decimal places if fractional
  const rawSum = parsed1.value + parsed2.value;
  const result = Math.abs(rawSum % 1) > 0 ? parseFloat(rawSum.toFixed(10)) : rawSum;

  return {
    success: true,
    operation: 'sum',
    number1: parsed1.value,
    number2: parsed2.value,
    result,
  };
};

module.exports = {
  parseStrictNumber,
  calculateSum,
};
