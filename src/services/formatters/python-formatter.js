const formatPython = (code, config = { indent: '    ' }) => {
  code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  code = fixCommonTypos(code);
  code = fixMalformedOperators(code);
  code = fixDelIfElse(code);
  code = splitAndFixStatements(code, config);
  code = applyPEP8Spacing(code);
  code = formatStructureAndIndentation(code, config);
  code = fixMisplacedReturn(code);
  return code;
};

const fixCommonTypos = (code) => {
  const typoMap = {
    'in t': 'int',
    'in put': 'input',
    'intt': 'int',
    'pri nt': 'print',
    'de f': 'def',
    'cl ass': 'class',
  };

  let fixedCode = code;
  for (const [typo, correction] of Object.entries(typoMap)) {
    const regex = new RegExp(`(?<!\\w)${typo.replace(' ', '\\s+')}(?!\\w)`, 'gi');
    fixedCode = fixedCode.replace(regex, correction);
  }
  return fixedCode;
};

const fixMalformedOperators = (code) => {
  return code
    .replace(/\bf\s+or\s+/gi, 'for ')
    .replace(/\bfro\s+/gi, 'for ')
    .replace(/\bfr\s+/gi, 'for ')
    .replace(/=\s*=/g, '==')
    .replace(/!\s*=/g, '!=')
    .replace(/<\s*=/g, '<=')
    .replace(/>\s*=/g, '>=')
    .replace(/(\w+)\s*\+\s*=/g, '$1 += ')
    .replace(/(\w+)\s*-\s*=/g, '$1 -= ')
    .replace(/(\w+)\s*\*\s*=/g, '$1 *= ')
    .replace(/(\w+)\s*\/\s*=/g, '$1 /= ')
    .replace(/(\w+)\s*%\s*=/g, '$1 %= ');
};

const fixDelIfElse = (code) => {
  return code
    .replace(/\bdel\s+if\b/gi, 'if')
    .replace(/\bdel\s+else\b/gi, 'else')
    .replace(/\bdel\s+elif\b/gi, 'elif');
};
try:
    x = int(input('x:'))
    y = int(input('y:'))
    print('res:', sum([i * y if i % 2 == 0 else i - y for i in range(x)]))


class a:

    def __init__(s, n):
        s.n = n
        s.d = {}

    def add(s, k, v):
        s.d[k]=v if k not in s.d else s.d[k]+v

    def rm(s, k):
        del s.d[k] if k in s.d else print('nope')

    def show(s):
        print('data:', s.d)
        o = a('obj')
        o.add('a', 1)
        o.add('a', 2)
        o.rm('b')
        o.show()
except:
    print('fail')
const applyPEP8Spacing = (code) => {
  const lines = code.split('\n');
  
  return lines.map(line => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return line;
    }

    const stringPlaceholders = [];
    let counter = 0;
    let processed = line;

    processed = processed.replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, (match) => {
      const placeholder = `__STR_${counter++}__`;
      stringPlaceholders.push({ placeholder, content: match });
      return placeholder;
    });

    processed = processed
      .replace(/(\w+)\s*=\s*(?![=!<>])/g, '$1 = ')
      .replace(/\s*==\s*/g, ' == ')
      .replace(/\s*!=\s*/g, ' != ')
      .replace(/\s*<=\s*/g, ' <= ')
      .replace(/\s*>=\s*/g, ' >= ')
      .replace(/(\w|\))\s*<\s*(\w|\()/g, '$1 < $2')
      .replace(/(\w|\))\s*>\s*(\w|\()/g, '$1 > $2')
      .replace(/(\w|\))\s*\+\s*(\w|\()/g, '$1 + $2')
      .replace(/(\w|\))\s*-\s*(\w|\()/g, '$1 - $2')
      .replace(/(\w|\))\s*\*\s*(\w|\()/g, '$1 * $2')
      .replace(/(\w|\))\s*\/\s*(\w|\()/g, '$1 / $2')
      .replace(/(\w|\))\s*%\s*(\w|\()/g, '$1 % $2')
      .replace(/\b(del|return|yield|raise|assert|import|from|global|nonlocal)\s*/g, '$1 ')
      .replace(/(?<!\w)(and|or|not|in|is)(?!\w)\s*/g, '$1 ')
      .replace(/\b(if|elif|while|for)\s*/g, '$1 ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/(\w)\s*\(/g, '$1(')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\{\s+/g, '{')
      .replace(/\s+\}/g, '}')
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']');

    stringPlaceholders.forEach(({ placeholder, content }) => {
      processed = processed.replace(placeholder, content);
    });

    return processed;
  }).join('\n');
};

const formatStructureAndIndentation = (code, config) => {
  const lines = code.split('\n').filter(line => line.trim());
  const result = [];
  let indentLevel = 0;
  let tryBlockLevel = -1; // Track the indent level of the try block

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith('#')) {
      result.push(config.indent.repeat(indentLevel) + trimmed);
      continue;
    }

    // Handle try block start
    if (trimmed.match(/^try:/)) {
      tryBlockLevel = indentLevel;
    }

    // Handle dedent for except/finally, resetting to try block level
    if (trimmed.match(/^(except(\s.*)?:|finally:)/)) {
      indentLevel = tryBlockLevel !== -1 ? tryBlockLevel : Math.max(0, indentLevel - 1);
    }

    // Handle other dedent keywords
    if (trimmed.match(/^(else:|elif\s)/)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const isClass = trimmed.match(/^class\s+\w+.*:/);
    const isFunction = trimmed.match(/^def\s+\w+.*:/);
    const isImport = trimmed.match(/^(import|from)\s/);

    let isMethod = false;
    if (isFunction) {
      for (let j = result.length - 1; j >= 0; j--) {
        const prevLine = result[j].trim();
        if (!prevLine) continue;

        if (prevLine.match(/^class\s+\w+.*:/)) {
          isMethod = true;
          break;
        }

        if (prevLine.match(/^(def\s|import|from)\s/) &&
            result[j].indexOf(config.indent) !== 0) {
          break;
        }
      }
    }

    if (isClass || (isFunction && !isMethod)) {
      if (result.length > 0) {
        result.push('');
        result.push('');
      }
      indentLevel = 0;
    } else if (isMethod) {
      if (result.length > 0) {
        result.push('');
      }
      indentLevel = 1;
    } else if (isImport) {
      indentLevel = 0;
      if (result.length > 0 && !result[result.length - 1].match(/^(import|from)/)) {
        result.push('');
      }
    } else if (trimmed.match(/^try:/)) {
      if (indentLevel > 0) {
        const prevNonEmpty = result.filter(r => r.trim()).pop();
        if (prevNonEmpty && !prevNonEmpty.match(/^\s*(def|class|if|for|while)/)) {
          indentLevel = 0;
          result.push('');
        }
      }
    }

    result.push(config.indent.repeat(indentLevel) + trimmed);

    if (trimmed.endsWith(':')) {
      indentLevel++;
    }
  }

  const cleaned = [];
  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    if (line === '') {
      if (cleaned[cleaned.length - 1] === '' &&
          cleaned[cleaned.length - 2] === '') {
        continue;
      }
    }
    cleaned.push(line);
  }

  while (cleaned.length > 0 && cleaned[cleaned.length - 1] === '') {
    cleaned.pop();
  }

  return cleaned.join('\n') + '\n';
};

const fixMisplacedReturn = (code) => {
  const lines = code.split('\n');
  const fixed = [];
  let insideLoop = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (/^for\s+.*:|^while\s+.*:/.test(trimmed)) {
      insideLoop = true;
      fixed.push(line);
      continue;
    }

    if (insideLoop && /^return\s+/.test(trimmed)) {
      insideLoop = false;
      fixed.push('');
      fixed.push(line);
      continue;
    }

    fixed.push(line);
  }

  return fixed.join('\n');
};

module.exports = formatPython;
