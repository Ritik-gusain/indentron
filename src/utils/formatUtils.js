class FormatUtils {
  static normalizeWhitespace(code) {
    return code
      .replace(/\r\n/g, '\n')
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
      case 'cpp':
      case 'php':
        return code
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '');
      case 'python':
        return code.replace(/#.*$/gm, '');
      case 'html':
      case 'xml':
        return code.replace(/<!--[\s\S]*?-->/g, '');
      case 'css':
        return code.replace(/\/\*[\s\S]*?\*\//g, '');
      default:
        return code;
    }
  }

  static isOpeningBrace(char) {
    return ['{', '[', '('].includes(char);
  }

  static isClosingBrace(char) {
    return ['}', ']', ')'].includes(char);
  }

  static getMatchingBrace(char) {
    const pairs = { '{': '}', '[': ']', '(': ')' };
    return pairs[char] || char;
  }

  static splitIntoTokens(code) {
    const tokens = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
        current += char;
      } else if (!inString && /\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
  }
}

module.exports = FormatUtils;