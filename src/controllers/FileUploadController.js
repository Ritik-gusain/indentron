const { HTTP_STATUS } = require('../constants');

class FileUploadController {
  uploadFile(req, res) {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'No file uploaded' });
    }
    res.status(HTTP_STATUS.OK).json({ filename: req.file.originalname, size: req.file.size, content: req.file.buffer.toString('utf8') });
  }
}

module.exports = FileUploadController;