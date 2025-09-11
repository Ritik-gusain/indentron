const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const Logger = require('./utils/logger');
const routes = require('./routes');
const { HTTP_STATUS, MESSAGES } = require('./constants');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.ENDPOINT_NOT_FOUND });
});

// Error handler
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
});

module.exports = app;