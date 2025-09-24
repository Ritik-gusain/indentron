const express = require('express');
const path = require('path');
const formatRoutes = require('./formatRoutes');
const healthRoutes = require('./healthRoutes');
const shareRoutes = require('./shareRoutes');
const fileUploadRoutes = require('./fileUploadRoutes');

const router = express.Router();

// API routes
router.use('/', formatRoutes);
router.use('/', healthRoutes);
router.use('/', shareRoutes);
router.use('/', fileUploadRoutes);

// Serve main page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

module.exports = router;