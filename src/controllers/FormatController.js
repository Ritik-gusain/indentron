const FormatterService = require('../services/FormatterService');
const AnalyticsService = require('../services/AnalyticsService');
const Logger = require('../utils/logger');
const formatUtils = require('../utils/formatUtils');
const { HTTP_STATUS } = require('../constants');

class FormatController {
  constructor() {
    this.formatterService = new FormatterService();
    this.analyticsService = new AnalyticsService();
  }

  async formatCode(req, res) {
    try {
      const { 
        code, 
        language = 'javascript', 
        action = 'format'
      } = req.body;
      
      const startTime = Date.now();
      let result;

      switch (action.toLowerCase()) {
        case 'format':
          result = await this.formatterService.format(code, language, true);
          break;
        case 'minify':
          result = this.formatterService.minify(code, language);
          break;
        case 'beautify':
          result = this.formatterService.beautify(code, language);
          break;
        default:
          result = await this.formatterService.format(code, language, true);
      }

      const processingTime = Date.now() - startTime;
      this.analyticsService.recordRequest(language, action, processingTime);
      
      Logger.info(`Formatted ${language} code (${action}) in ${processingTime}ms`);

      res.status(HTTP_STATUS.OK).json({
        formatted: result,
        originalLength: code.length,
        formattedLength: result.length,
        processingTime,
        language,
        action,
        success: true
      });
    } catch (error) {
      Logger.error('Format error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        error: error.message,
        success: false
      });
    }
  }

  getAnalytics(req, res) {
    try {
      const stats = this.analyticsService.getStats();
      res.status(HTTP_STATUS.OK).json(stats);
    } catch (error) {
      Logger.error('Analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve analytics' });
    }
  }
}

module.exports = FormatController;