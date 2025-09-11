const express = require('express');
const FormatController = require('../controllers/FormatController');
const { formatLimiter } = require('../middleware/rateLimiter');
const { validateFormatRequest } = require('../middleware/validation');
const { SUPPORTED_LANGUAGES, ACTIONS, HTTP_STATUS } = require('../constants');
const config = require('../../config/config');

const router = express.Router();
const formatController = new FormatController();

// Format endpoint
router.post('/format', formatLimiter, validateFormatRequest, (req, res) => 
  formatController.formatCode(req, res)
);

// Get supported languages
router.get('/languages', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    supported: SUPPORTED_LANGUAGES,
    actions: ACTIONS,
    maxCodeLength: config.maxCodeLength
  });
});

// Analytics endpoint
router.get('/analytics', (req, res) => formatController.getAnalytics(req, res));

module.exports = router;