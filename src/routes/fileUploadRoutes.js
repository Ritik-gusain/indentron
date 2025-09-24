const express = require('express');
const multer = require('multer');
const FileUploadController = require('../controllers/FileUploadController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const fileUploadController = new FileUploadController();

router.post('/upload', upload.single('codeFile'), fileUploadController.uploadFile);

module.exports = router;