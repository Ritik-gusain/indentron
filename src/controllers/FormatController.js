const FormatterService = require('../services/FormatterService');
const AnalyticsService = require('../services/AnalyticsService');
const Logger = require('../utils/logger');
const { HTTP_STATUS } = require('../constants');

class FormatController {
  constructor() {
    this.formatterService = new FormatterService();
    this.analyticsService = new AnalyticsService();
    
    // Rate limiting map (simple in-memory implementation)
    this.rateLimitMap = new Map();
    this.rateLimitWindow = 60000; // 1 minute
    this.rateLimitMax = 30; // 30 requests per minute
  }

  async formatCode(req, res) {
    try {
      // Basic rate limiting
      const clientIp = req.ip || req.connection.remoteAddress;
      if (!this.checkRateLimit(clientIp)) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          success: false
        });
      }

      const { 
        code, 
        language = 'javascript', 
        action = 'format',
        useAI = false,
        options = {}
      } = req.body;
      
      // Validation
      if (!code) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No code provided',
          success: false
        });
      }

      if (code.length > 100000) { // 100KB limit
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Code too large. Maximum size is 100KB',
          success: false
        });
      }

      const startTime = Date.now();
      let result;
      let error = null;

      try {
        switch (action.toLowerCase()) {
          case 'format':
            result = await this.formatterService.format(code, language, useAI);
            break;
          
          default:
            result = await this.formatterService.format(code, language, useAI);
        }
      } catch (formatError) {
        error = formatError;
        Logger.error('Formatting error:', formatError);
        
        // Try to extract line/column information from error
        const lineMatch = formatError.message.match(/line (\d+)/i);
        const columnMatch = formatError.message.match(/column (\d+)/i);
        
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: formatError.message,
          success: false,
          lineNumber: lineMatch ? parseInt(lineMatch[1]) : undefined,
          columnNumber: columnMatch ? parseInt(columnMatch[1]) : undefined,
        });
      }

      const processingTime = Date.now() - startTime;
      
      // Record analytics
      this.analyticsService.recordRequest(language, action, processingTime, !error);
      
      // Log successful formatting
      Logger.info(`Formatted ${language} code (${action}) in ${processingTime}ms`);

      // Calculate statistics
      const stats = {
        originalLength: code.length,
        formattedLength: result.length,
        compression: ((result.length - code.length) / code.length * 100).toFixed(2),
        linesOriginal: code.split('\n').length,
        linesFormatted: result.split('\n').length,
        processingTime,
        language,
        action,
        success: true,
        usedAI: useAI
      };

      res.status(HTTP_STATUS.OK).json({
        formatted: result,
        ...stats
      });
    } catch (error) {
      Logger.error('Unexpected error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: 'An unexpected error occurred',
        success: false
      });
    }
  }

  async validateCode(req, res) {
    try {
      const { code, language = 'javascript' } = req.body;
      
      if (!code) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          valid: false,
          error: 'No code provided'
        });
      }

      let isValid = true;
      let errors = [];

      // Language-specific validation
      switch (language.toLowerCase()) {
        case 'json':
          try {
            JSON.parse(code);
          } catch (e) {
            isValid = false;
            errors.push(e.message);
          }
          break;
        
        case 'javascript':
        case 'typescript':
          // Basic syntax validation (limited check)
          try {
            // Check for basic syntax errors like unmatched braces
            let braceCount = 0;
            let parenCount = 0;
            let bracketCount = 0;
            
            for (let char of code) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
              if (char === '(') parenCount++;
              if (char === ')') parenCount--;
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
            }
            
            if (braceCount !== 0) errors.push('Unmatched braces');
            if (parenCount !== 0) errors.push('Unmatched parentheses');
            if (bracketCount !== 0) errors.push('Unmatched brackets');
            
            isValid = errors.length === 0;
          } catch (e) {
            isValid = false;
            errors.push(e.message);
          }
          break;
        
        case 'html':
          // Check for basic HTML validity
          const openTags = [];
          const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
          let match;
          
          while ((match = tagRegex.exec(code)) !== null) {
            const tagName = match[1].toLowerCase();
            if (match[0].startsWith('</')) {
              if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
                errors.push(`Mismatched closing tag: ${tagName}`);
                isValid = false;
              } else {
                openTags.pop();
              }
            } else if (!match[0].endsWith('/>')) {
              openTags.push(tagName);
            }
          }
          
          if (openTags.length > 0) {
            errors.push(`Unclosed tags: ${openTags.join(', ')}`);
            isValid = false;
          }
          break;
        
        default:
          // For other languages, just check if code is not empty
          isValid = code.trim().length > 0;
      }

      res.status(HTTP_STATUS.OK).json({
        valid: isValid,
        errors: errors.length > 0 ? errors : undefined,
        language
      });
    } catch (error) {
      Logger.error('Validation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        valid: false,
        error: 'Validation failed'
      });
    }
  }

  getAnalytics(req, res) {
    try {
      const stats = this.analyticsService.getStats();
      res.status(HTTP_STATUS.OK).json(stats);
    } catch (error) {
      Logger.error('Analytics error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: 'Failed to retrieve analytics',
        success: false
      });
    }
  }

  getSupportedLanguages(req, res) {
    const languages = [
      { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx'] },
      { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'] },
      { id: 'python', name: 'Python', extensions: ['.py'] },
      { id: 'java', name: 'Java', extensions: ['.java'] },
      { id: 'json', name: 'JSON', extensions: ['.json'] },
      { id: 'css', name: 'CSS', extensions: ['.css'] },
      { id: 'html', name: 'HTML', extensions: ['.html', '.htm'] },
      { id: 'c', name: 'C', extensions: ['.c', '.h'] },
      { id: 'cpp', name: 'C++', extensions: ['.cpp', '.hpp', '.cc'] },
      { id: 'csharp', name: 'C#', extensions: ['.cs'] }
    ];
    
    res.status(HTTP_STATUS.OK).json({
      languages,
      success: true
    });
  }

  checkRateLimit(clientIp) {
    const now = Date.now();
    const userRequests = this.rateLimitMap.get(clientIp) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );
    
    if (recentRequests.length >= this.rateLimitMax) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimitMap.set(clientIp, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      this.cleanupRateLimitMap();
    }
    
    return true;
  }

  cleanupRateLimitMap() {
    const now = Date.now();
    for (const [ip, requests] of this.rateLimitMap.entries()) {
      const recentRequests = requests.filter(
        timestamp => now - timestamp < this.rateLimitWindow
      );
      
      if (recentRequests.length === 0) {
        this.rateLimitMap.delete(ip);
      } else {
        this.rateLimitMap.set(ip, recentRequests);
      }
    }
  }
}

module.exports = FormatController;