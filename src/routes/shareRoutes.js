const express = require('express');
const ShareController = require('../controllers/ShareController');

const router = express.Router();
const shareController = new ShareController();

router.post('/share', (req, res) => shareController.createSnippet(req, res));
router.get('/share/:id', (req, res) => shareController.getSnippet(req, res));

module.exports = router;