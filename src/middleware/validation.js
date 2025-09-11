const config = require('../../config/config');

const validateFormatRequest = (req, res, next) => {
  const { code, language, action } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required and must be a string' });
  }

  if (code.length > config.maxCodeLength) {
    return res.status(400).json({ error: `Code exceeds maximum length of ${config.maxCodeLength} characters` });
  }

  if (language && !config.supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  if (action && !['format', 'beautify', 'minify'].includes(action.toLowerCase())) {
    return res.status(400).json({ error: `Unsupported action: ${action}` });
  }

  next();
};

module.exports = { validateFormatRequest };