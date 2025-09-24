const formatJavaScript = (code, config, language = 'javascript') => {
  // Step 1: Fix malformed operators first
  code = fixMalformedOperators(code);

  // Step 2: Preserve strings, template literals, and comments
  const preserved = [];
  let counter = 0;

  // Preserve template literals
  code = code.replace(/`(?:[^`\\]|\\.)*`/g, (match) => {
    const placeholder = `__TEMPLATE_${counter}__`;
    preserved.push({ placeholder, content: match });
    counter++;
    return placeholder;
  });

  // Preserve strings
  code = code.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, (match) => {
    const placeholder = `__STRING_${counter}__`;
    preserved.push({ placeholder, content: match });
    counter++;
    return placeholder;
  });

  // Preserve comments
  code = code.replace(/\/\/.*$/gm, (match) => {
    const placeholder = `__COMMENT_${counter}__`;
    preserved.push({ placeholder, content: match });
    counter++;
    return placeholder;
  });

  code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const placeholder = `__COMMENT_${counter}__`;
    preserved.push({ placeholder, content: match });
    counter++;
    return placeholder;
  });

  // Step 3: Format operators with VS Code style spacing
  code = formatOperators(code);

  // Step 4: Handle VS Code style structural formatting
  let result = '';
  let i = 0;

  while (i < code.length) {
    const char = code[i];
    const next = code[i + 1] || '';
    const prev = code[i - 1] || '';

    if (char === ':' && /[a-zA-Z0-9_)]/.test(prev) && next !== '=' && next !== ':') {
      result += ': '; // VS Code: space after object property colon
    } else if (char === ',' && !/\s/.test(next)) {
      result += ', '; // VS Code: space after comma
    } else if (char === '{') {
      if (!/\s/.test(prev)) {
        result += ' {'; // VS Code: space before opening brace
      } else {
        result += char;
      }
    } else if (char === '}' && next && !/\s/.test(next) && 
               next !== ';' && next !== ',' && next !== ')' && next !== '}') {
      result += '} '; // VS Code: space after closing brace if needed
    } else {
      result += char;
    }
    i++;
  }

  // Step 5: VS Code style line breaks and structure
  result = result
    .replace(/;\s*/g, ';\n')           // Line break after semicolon
    .replace(/{\s*/g, '{\n')          // Line break after opening brace
    .replace(/}\s*(?=\S)/g, '}\n')    // Line break after closing brace
    .replace(/}\s*else\s*{/g, '} else {')      // VS Code: } else { on same line
    .replace(/}\s*catch\s*\(/g, '} catch (')   // VS Code: } catch ( on same line
    .replace(/}\s*finally\s*{/g, '} finally {') // VS Code: } finally { on same line

  // Step 6: VS Code style indentation
  const lines = result.split('\n');
  const formatted = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      // VS Code: preserve some empty lines but not excessive
      if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
        formatted.push('');
      }
      continue;
    }

    // VS Code: single blank line before top-level declarations
    if (indentLevel === 0 && formatted.length > 0 && 
        formatted[formatted.length - 1] !== '' &&
        /^(interface|type|class|enum|function|const|let|var|import|export)\s/.test(trimmed)) {
      formatted.push('');
    }

    // Handle closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push(config.indent.repeat(indentLevel) + trimmed);

    // Handle opening braces
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }

  // Step 7: Restore preserved content
  let final = formatted.join('\n');
  for (const { placeholder, content } of preserved) {
    final = final.replace(new RegExp(placeholder, 'g'), content);
  }

  // Step 8: VS Code style final cleanup
  final = final
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // VS Code: max 2 consecutive newlines
    .replace(/\s*\[\s*\]/g, '[]')      // VS Code: no spaces in empty arrays
    .replace(/\)\s*:/g, '):')          // VS Code: no space before colon in function return types
    .replace(/\):\s*/g, '): ')         // VS Code: space after colon in return types
    .trim();

  return final;
};

const formatOperators = (code) => {
  // Protect multi-character operators (VS Code preserves these exactly)
  const protectedOps = [];
  let counter = 0;

  code = code.replace(
    /(===|!==|==|!=|<=|>=|=>|\+=|-=|\*=|\/=|%=|\+\+|--|&&|\|\||<<|>>)/g,
    (match) => {
      const placeholder = `__OP_${counter}__`;
      protectedOps.push({ placeholder, content: match });
      counter++;
      return placeholder;
    }
  );

  // VS Code style: space around single operators (but not in all contexts)
  code = code.replace(/([^=!<>+\-*/&|^~\s])([=+\-*/%&|^!<>])([^=!<>+\-*/&|^~\s])/g, '$1 $2 $3');

  // Restore protected operators
  for (const { placeholder, content } of protectedOps) {
    code = code.replace(new RegExp(placeholder, 'g'), content);
  }

  return code;
};

const fixMalformedOperators = (code) => {
  return code
    // Fix separated multi-character operators (main issue)
    .replace(/=\s*=\s*=/g, '===')
    .replace(/!\s*=\s*=/g, '!==')
    .replace(/=\s*>/g, '=>')     // CRITICAL: Fix => becoming = >
    .replace(/=\s*=/g, '==')
    .replace(/!\s*=/g, '!=')
    .replace(/<\s*=/g, '<=')
    .replace(/>\s*=/g, '>=')
    .replace(/\+\s*=/g, '+=')
    .replace(/-\s*=/g, '-=')
    .replace(/\*\s*=/g, '*=')
    .replace(/\/\s*=/g, '/=')
    .replace(/%\s*=/g, '%=')
    .replace(/&\s*&/g, '&&')
    .replace(/\|\s*\|/g, '||')
    .replace(/\+\s*\+/g, '++')
    .replace(/-\s*-/g, '--')
    .replace(/<\s*</g, '<<')
    .replace(/>\s*>/g, '>>');
};

module.exports = formatJavaScript;