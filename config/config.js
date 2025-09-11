const { SUPPORTED_LANGUAGES } = require('../src/constants');

module.exports = {
  port: process.env.PORT || 3000,
  supportedLanguages: SUPPORTED_LANGUAGES,
  maxCodeLength: 100000,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100 // requests per window
};