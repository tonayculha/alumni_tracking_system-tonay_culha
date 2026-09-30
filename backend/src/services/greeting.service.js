/**
 * Greeting Service
 * Handles greeting generation and parameter sanitization
 */

const formatGreeting = (rawName) => {
  if (!rawName || typeof rawName !== 'string') {
    return {
      name: 'Guest',
      message: 'Hello, Guest! Welcome to the Alumni Tracking System.',
    };
  }

  // Clean and sanitize name: trim whitespace and remove HTML tags
  const sanitized = rawName.trim().replace(/<[^>]*>?/gm, '');
  const cleanName = sanitized.length > 0 ? sanitized : 'Guest';

  return {
    name: cleanName,
    message: `Hello, ${cleanName}! Welcome to the Alumni Tracking System.`,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  formatGreeting,
};
