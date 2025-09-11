const express = require('express');
const { HTTP_STATUS } = require('../constants');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: require('../../package.json').version,
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;