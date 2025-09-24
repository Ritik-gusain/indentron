class FormatUtils {
  static normalizeWhitespace(code) {
    return code
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, '  ')
      .trim();
  }

  static countIndentLevel(line, indentSize = 2) {
    const leadingSpaces = line.match(/^\s*/)[0].length;
    return Math.floor(leadingSpaces / indentSize);
  }

  static addIndent(line, level, indentStr = '  ') {
    return indentStr.repeat(level) + line.trim();
  }

  static removeComments(code, language) {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
      case 'java':
      case 'c':
      case 'cpp':
      case 'csharp':
      case 'php':
        // Remove multi-line comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove single-line comments
        code = code.replace(/\/\/.*$/gm, '');
        break;
      case 'python':
        // Remove single-line comments
        code = code.replace(/#.*$/gm, '');
        // Remove multi-line strings used as comments
        code = code.replace(/'''[\s\S]*?'''/g, '');
        code = code.replace(/"""[\s\S]*?"""/g, '');
        break;
      case 'html':
      case 'xml':
        code = code.replace(/<!--[\s\S]*?-->/g, '');
        break;
      case 'css':
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        break;
      default:
        break;
    }
    return code;
  }

  static isOpeningBrace(char) {
    return ['{', '[', '('].includes(char);
  }

  static isClosingBrace(char) {
    return ['}', ']', ')'].includes(char);
  }

  static getMatchingBrace(char) {
    const pairs = { 
      '{': '}', '}': '{',
      '[': ']', ']': '[',
      '(': ')', ')': '('
    };
    return pairs[char] || null;
  }

  static validateBracePairs(code) {
    const stack = [];
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let errors = [];
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const prevChar = code[i - 1];
      const nextChar = code[i + 1];
      
      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
        continue;
      }
      
      // Skip if in string
      if (inString) continue;
      
      // Handle comments
      if (char === '/' && nextChar === '/') {
        // Skip until end of line
        while (i < code.length && code[i] !== '\n') i++;
        continue;
      }
      
      if (char === '/' && nextChar === '*') {
        // Skip until */
        i += 2;
        while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
        i++;
        continue;
      }
      
      // Check braces
      if (this.isOpeningBrace(char)) {
        stack.push({ char, position: i, line: code.substring(0, i).split('\n').length });
      } else if (this.isClosingBrace(char)) {
        if (stack.length === 0) {
          errors.push({
            type: 'unexpected_closing',
            char,
            position: i,
            line: code.substring(0, i).split('\n').length,
            message: `Unexpected closing ${char} at position ${i}`
          });
        } else {
          const last = stack.pop();
          const expected = this.getMatchingBrace(last.char);
          if (char !== expected) {
            errors.push({
              type: 'mismatched',
              expected,
              found: char,
              position: i,
              line: code.substring(0, i).split('\n').length,
              message: `Expected ${expected} but found ${char} at position ${i}`
            });
          }
        }
      }
    }
    
    // Check for unclosed braces
    while (stack.length > 0) {
      const unclosed = stack.pop();
      errors.push({
        type: 'unclosed',
        char: unclosed.char,
        position: unclosed.position,
        line: unclosed.line,
        message: `Unclosed ${unclosed.char} at line ${unclosed.line}`
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static splitIntoTokens(code) {
    const tokens = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const prevChar = code[i - 1];
      const nextChar = code[i + 1];
      
      // Handle strings
      if (!inComment && (char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          inString = true;
          stringChar = char;
          current = char;
        } else if (char === stringChar) {
          current += char;
          tokens.push(current);
          current = '';
          inString = false;
          stringChar = '';
        } else {
          current += char;
        }
      } else if (inString) {
        current += char;
      }
      // Handle comments
      else if (!inString && char === '/' && nextChar === '/') {
        if (current.trim()) {
          tokens.push(current.trim());
        }
        current = '//';
        i += 2;
        while (i < code.length && code[i] !== '\n') {
          current += code[i];
          i++;
        }
        tokens.push(current);
        current = '';
        i--; // Back up one since the loop will increment
      } else if (!inString && char === '/' && nextChar === '*') {
        if (current.trim()) {
          tokens.push(current.trim());
        }
        current = '/*';
        i += 2;
        while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
          current += code[i];
          i++;
        }
        if (i < code.length - 1) {
          current += '*/';
          i++;
        }
        tokens.push(current);
        current = '';
      }
      // Handle operators and punctuation
      else if (!inString && /[{}()\[\];,]/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
        }
        tokens.push(char);
        current = '';
      }
      // Handle whitespace
      else if (!inString && /\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      }
      // Build current token
      else {
        current += char;
      }
    }
    
    if (current.trim()) {
      tokens.push(current.trim());
    }
    
    return tokens;
  }

  static detectIndentStyle(code) {
    const lines = code.split('\n');
    let tabCount = 0;
    let spaceCount = 0;
    let twoSpaceCount = 0;
    let fourSpaceCount = 0;
    
    for (const line of lines) {
      const leadingWhitespace = line.match(/^[\s\t]+/);
      if (leadingWhitespace) {
        const whitespace = leadingWhitespace[0];
        if (whitespace.includes('\t')) {
          tabCount++;
        } else {
          spaceCount++;
          if (whitespace.length % 4 === 0) {
            fourSpaceCount++;
          }
          if (whitespace.length % 2 === 0) {
            twoSpaceCount++;
          }
        }
      }
    }
    
    if (tabCount > spaceCount) {
      return { type: 'tab', size: 1 };
    } else if (fourSpaceCount > twoSpaceCount) {
      return { type: 'space', size: 4 };
    } else {
      return { type: 'space', size: 2 };
    }
  }

  static getLineAndColumn(code, position) {
    const lines = code.substring(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  static escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static preserveLineBreaks(code, callback) {
    // Preserve intentional line breaks while formatting
    const placeholder = '__LINEBREAK__';
    const doubleLineBreaks = code.split(/\n\s*\n/).join(placeholder);
    const formatted = callback(doubleLineBreaks);
    return formatted.split(placeholder).join('\n\n');
  }

  static fixCommonIssues(code, language) {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        // Fix missing semicolons
        code = code.replace(/^(\s*(?:var|let|const|return|throw|break|continue)\s+.+?)$/gm, (match) => {
          if (!match.trimEnd().endsWith(';') && !match.trimEnd().endsWith('{')) {
            return match.trimEnd() + ';';
          }
          return match;
        });
        break;
      
      case 'json':
        // Remove trailing commas
        code = code.replace(/,(\s*[}\]])/g, '$1');
        // Fix unquoted keys
        code = code.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        break;
      
      case 'python':
        // Fix common Python issues
        // Ensure colons after control structures
        code = code.replace(/^(\s*(?:if|elif|else|for|while|def|class|try|except|finally|with)\s+.+?)$/gm, (match) => {
          if (!match.trimEnd().endsWith(':')) {
            return match.trimEnd() + ':';
          }
          return match;
        });
        break;
    }
    
    return code;
  }

  static measureComplexity(code) {
    // Simple complexity measurement
    const metrics = {
      lines: code.split('\n').length,
      characters: code.length,
      functions: (code.match(/function\s+\w+/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      loops: (code.match(/\b(for|while|do)\b/g) || []).length,
      conditionals: (code.match(/\b(if|else|switch|case)\b/g) || []).length,
      complexity: 0
    };
    
    // Calculate cyclomatic complexity (simplified)
    metrics.complexity = 1 + metrics.conditionals + metrics.loops;
    
    return metrics;
  }
}

module.exports = FormatUtils;