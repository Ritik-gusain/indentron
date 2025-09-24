const AIFormatterService = require('./AIFormatterService');
const formatPython = require('./formatters/python-formatter');
const formatJavaScript = require('./formatters/js-formatter');
const formatJSON = require('./formatters/json-formatter');
const formatCSS = require('./formatters/css-formatter');
const formatHTML = require('./formatters/html-formatter');
const formatCStyle = require('./formatters/cstyle-formatter');
const formatGeneric = require('./formatters/generic-formatter');

class FormatterService {
  constructor() {
    this.aiFormatter = new AIFormatterService();
    
    this.languages = {
      javascript: { indent: '  ', semicolon: true, quotes: 'single' },
      typescript: { indent: '  ', semicolon: true, quotes: 'single' },
      tsx: { indent: '  ', semicolon: true, quotes: 'single' },
      typescriptreact: { indent: '  ', semicolon: true, quotes: 'single' },
      python: { indent: '    ', spacesAroundOperators: true },
      json: { indent: '  ', sortKeys: false },
      css: { indent: '  ', semicolon: true },
      html: { indent: '  ', selfClosing: true },
      java: { indent: '    ', semicolon: true },
      c: { indent: '    ', semicolon: true },
      cpp: { indent: '    ', semicolon: true },
      csharp: { indent: '    ', semicolon: true }
    };
  }

  async format(code, language = 'javascript', useAI = false) {
    const config = this.languages[language.toLowerCase()];
    if (!config) {
      throw new Error(`Language ${language} not supported`);
    }

    // Normalize line endings and tabs
    code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, config.indent).trim();

    // Try AI formatting first if enabled
    if (useAI) {
      try {
        const aiFormatted = await this.aiFormatter.enhanceFormatting(code, language);
        if (aiFormatted) return aiFormatted;
      } catch (error) {
        // Silently fall back to standard formatting
      }
    }

    // Standard formatting
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
      case 'tsx':
      case 'typescriptreact':
        return formatJavaScript(code, config, language);
      case 'python':
        return formatPython(code, config);
      case 'json':
        return formatJSON(code, config);
      case 'css':
        return formatCSS(code, config);
      case 'html':
        return formatHTML(code, config);
      case 'java':
      case 'c':
      case 'cpp':
      case 'csharp':
        return formatCStyle(code, config, language);
      default:
        return formatGeneric(code, config);
    }
  }
}

module.exports = FormatterService;
