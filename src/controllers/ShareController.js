const ShareService = require('../services/ShareService');
const { HTTP_STATUS } = require('../constants');

class ShareController {
  constructor() {
    this.shareService = new ShareService();
  }

  createSnippet(req, res) {
    const { code, language } = req.body;
    if (!code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Code is required' });
    }

    const id = this.shareService.createSnippet(code, language);
    res.status(HTTP_STATUS.OK).json({ id });
  }

  getSnippet(req, res) {
    const { id } = req.params;
    const snippet = this.shareService.getSnippet(id);

    if (snippet) {
      res.status(HTTP_STATUS.OK).json(snippet);
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Snippet not found' });
    }
  }
}

module.exports = ShareController;