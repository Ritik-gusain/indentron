const rateLimit = require('express-rate-limit');
const config = require('../../config/config');
const { MESSAGES } = require('../constants');

const formatLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: {
    error: MESSAGES.TOO_MANY_REQUESTS,
    retryAfter: Math.ceil(config.rateLimitWindow / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { formatLimiter };