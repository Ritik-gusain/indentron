const AIFormatterService = require('./AIFormatterService');

class FormatterService {
  constructor() {
    this.aiFormatter = new AIFormatterService();
    
    this.languages = {
      javascript: { 
        indent: '  ', 
        semicolon: true, 
        quotes: 'single',
        maxLineLength: 80,
        bracketSpacing: true 
      },
      python: { 
        indent: '    ', 
        maxLineLength: 88,
        spacesAroundOperators: true
      },
      json: { 
        indent: '  ', 
        sortKeys: true,
        bracketSpacing: true
      },
      css: { 
        indent: '  ', 
        semicolon: true,
        spacesAroundOperators: true
      },
      html: { 
        indent: '  ', 
        selfClosing: true,
        maxAttributesPerLine: 3
      },
      java: { 
        indent: '    ', 
        semicolon: true,
        bracketSpacing: true
      },
      typescript: { 
        indent: '  ', 
        semicolon: true, 
        quotes: 'single',
        maxLineLength: 80,
        bracketSpacing: true
      }
    };
  }

  async format(code, language = 'javascript', useAI = true) {
    const config = this.languages[language.toLowerCase()];
    if (!config) {
      throw new Error(`Language ${language} not supported`);
    }

    // Pre-process the code to normalize whitespace
    code = code.replace(/\r\n/g, '\n')
              .replace(/\t/g, '  ')
              .trim();

    // Try AI formatting first if enabled
    if (useAI) {
      try {
        const aiFormatted = await this.aiFormatter.enhanceFormatting(code, language);
        if (aiFormatted) {
          return aiFormatted;
        }
      } catch (error) {
        console.error('AI formatting failed, falling back to standard formatting:', error);
      }
    }

    // Fall back to standard formatting
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.formatJavaScript(code, config);
      case 'python':
        return this.formatPython(code, config);
      case 'json':
        return this.formatJSON(code, config);
      case 'css':
        return this.formatCSS(code, config);
      case 'html':
        return this.formatHTML(code, config);
      case 'java':
      case 'c':
      case 'cpp':
      case 'csharp':
        return this.formatCStyle(code, config);
      case 'typescript':
        return this.formatJavaScript(code, config);
      default:
        return this.formatGeneric(code, config);
    }
  }

  formatJavaScript(code, config) {
    let formatted = code.replace(/\)\s*{/g, ') {');
    let indentLevel = 0;
    let inString = false;
    let stringChar = '';

    let result = '';
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const prevChar = i > 0 ? formatted[i - 1] : '';

      // Handle string literals
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      if (char === '{' && !inString) {
        result += ` {\n${config.indent.repeat(++indentLevel)}`;
      } else if (char === '}' && !inString) {
        indentLevel--;
        result += `\n${config.indent.repeat(indentLevel)}}`;
      } else if (char === ';' && !inString) {
        result += `;\n${config.indent.repeat(indentLevel)}`;
      } else if (char === '\n') {
        result += `\n${config.indent.repeat(indentLevel)}`;
      } else {
        result += char;
      }
    }

    return result.replace(/\n\s*\n/g, '\n').trim();
  }

  formatPython(code, config) {
    let lines = code.split('\n');
    let formatted = [];
    let indentLevel = 0;
    let prevIndentLevel = 0;

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) {
        formatted.push('');
        continue;
      }

      // Handle dedent keywords
      if (trimmed.match(/^(else|elif|except|finally|case|match)\b/)) {
        indentLevel = Math.max(0, prevIndentLevel - 1);
      } else if (trimmed.match(/^(return|break|continue|pass|raise)\b/) && !trimmed.endsWith(':')) {
        // Keep current indent for these statements
      }
      else {
        // Calculate indent based on previous line
        let originalIndent = line.length - line.trimStart().length;
        if (originalIndent > 0 && formatted.length > 0) {
          let expectedIndent = Math.floor(originalIndent / 4);
          indentLevel = Math.max(0, expectedIndent);
        }
      }

      formatted.push(config.indent.repeat(indentLevel) + trimmed);
      prevIndentLevel = indentLevel;

      // Increase indent after colon
      if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
        indentLevel++;
      }
    }

    return formatted.join('\n');
  }

  formatJSON(code, config) {
    try {
      let parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, config.indent);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }

  formatCSS(code, config) {
    let formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*(?!\s*})/g, ';\n')
      .replace(/}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n')
      .split('\n');
    
    let result = [];
    let indentLevel = 0;
    
    for (let line of formatted) {
      let trimmed = line.trim();
      if (!trimmed) {
        result.push('');
        continue;
      }
      
      if (trimmed === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      if (trimmed === '}' || trimmed.endsWith('{')) {
        result.push(config.indent.repeat(indentLevel) + trimmed);
      } else {
        result.push(config.indent.repeat(indentLevel + 1) + trimmed);
      }
      
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }
    }
    
    return result.join('\n').replace(/\n\n+/g, '\n');
  }

  formatHTML(code, config) {
    let lines = code.split(/(?<=>)|(?=<)/).filter(line => line.trim());
    let formatted = [];
    let indentLevel = 0;
    
    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;
      
      // Handle closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Self-closing or void elements
      let isSelfClosing = trimmed.endsWith('/>') || 
        /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b[^>]*>$/i.test(trimmed);
      
      formatted.push(config.indent.repeat(indentLevel) + trimmed);
      
      // Handle opening tags (but not self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !isSelfClosing) {
        indentLevel++;
      }
    }
    
    return formatted.join('\n');
  }

  formatCStyle(code, config) {
    // Pre-format common patterns
    let formatted = code
      .replace(/\)\s*{/g, ') {')
      .replace(/}\s*else\s*{/g, '} else {')
      .replace(/}\s*catch\s*\(/g, '} catch (')
      .replace(/}\s*finally\s*{/g, '} finally {');
    
    let indentLevel = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;

    let result = '';
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const prevChar = i > 0 ? formatted[i - 1] : '';
      const nextChar = i < formatted.length - 1 ? formatted[i + 1] : '';

      // Handle comments
      if (char === '/' && nextChar === '/' && !inString) {
        inComment = true;
      } else if (char === '\n' && inComment) {
        inComment = false;
      }

      // Handle string literals
      if ((char === '"' || char === "'") && prevChar !== '\\' && !inComment) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      if (char === '{' && !inString && !inComment) {
        result += ` {\n${config.indent.repeat(++indentLevel)}`;
      } else if (char === '}' && !inString && !inComment) {
        indentLevel--;
        result += `\n${config.indent.repeat(indentLevel)}}`;
      } else if (char === ';' && !inString && !inComment) {
        result += `;\n${config.indent.repeat(indentLevel)}`;
      } else if (char === '\n') {
        if (!inComment) {
          result += `\n${config.indent.repeat(indentLevel)}`;
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }

    return result.replace(/\n\s*\n/g, '\n').trim();
  }

  formatGeneric(code, config) {
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => config.indent + line)
      .join('\n');
  }

  minify(code, language = 'javascript') {
    if (language === 'json') {
      try {
        return JSON.stringify(JSON.parse(code));
      } catch (e) {
        return code.replace(/\s+/g, '');
      }
    }
    
    let minified = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('')
      .replace(/\s*([{}();,=+\-*\/<>"!&|])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim();
    
    return minified;
  }

  beautify(code, language = 'javascript') {
    let formatted = this.format(code, language, false); // Disable AI for beautify
    
    // Add extra spacing for readability
    return formatted
      .replace(/([,;])(?!\s)/g, '$1 ')
      .replace(/([=+\-*\/<>!&|])(?!\s)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .split('\n')
      .map(line => {
        let trimmed = line.trim();
        if (!trimmed) return '';
        let indent = line.match(/^\s*/)[0];
        return indent + trimmed;
      })
      .join('\n');
  }
}

module.exports = FormatterService;