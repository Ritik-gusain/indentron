const formatJSON = (code, config) => {
  try {
    // VS Code JSON: Parse and format with consistent spacing
    const parsed = JSON.parse(code);
    
    // VS Code uses specific indentation (usually 2 or 4 spaces)
    const indentSize = config.indent === '\t' ? '\t' : config.indent;
    return JSON.stringify(parsed, null, indentSize);
    
  } catch (e) {
    // VS Code approach: Try to fix common JSON issues
    try {
      let fixed = code;
      
      // Remove JavaScript-style comments (VS Code JSONC support)
      fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
      fixed = fixed.replace(/\/\/.*$/gm, '');
      
      // VS Code: Remove trailing commas (common JSON error)
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      
      // VS Code: Add quotes to unquoted keys
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      // VS Code: Convert single quotes to double quotes
      fixed = fixed.replace(/'/g, '"');
      
      // VS Code: Handle undefined values
      fixed = fixed.replace(/:\s*undefined/g, ': null');
      
      // VS Code: Remove function values (not valid JSON)
      fixed = fixed.replace(/,?\s*"[^"]*":\s*function[^,}]*,?/g, '');
      
      // Clean up resulting formatting issues
      fixed = fixed.replace(/,,+/g, ',');
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      fixed = fixed.replace(/{\s*,/g, '{');
      fixed = fixed.replace(/\[\s*,/g, '[');
      
      const parsed = JSON.parse(fixed);
      const indentSize = config.indent === '\t' ? '\t' : config.indent;
      return JSON.stringify(parsed, null, indentSize);
      
    } catch (e2) {
      // VS Code fallback: Basic structural formatting
      return formatInvalidJSON(code, config);
    }
  }
};

const formatInvalidJSON = (code, config) => {
  // VS Code style formatting for invalid JSON
  let result = code;
  
  // VS Code: consistent spacing around colons and commas
  result = result.replace(/\s*:\s*/g, ': ');
  result = result.replace(/\s*,\s*/g, ',');
  
  // VS Code: proper line breaks
  result = result.replace(/,(?!\s*[\]\}])/g, ',\n');
  result = result.replace(/\s*{\s*/g, '{\n');
  result = result.replace(/\s*}\s*/g, '\n}');
  result = result.replace(/\s*\[\s*/g, '[\n');
  result = result.replace(/\s*\]\s*/g, '\n]');
  
  // VS Code style indentation
  const lines = result.split('\n');
  const formatted = [];
  let indentLevel = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // VS Code: decrease indent for closing brackets
    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    formatted.push(config.indent.repeat(indentLevel) + trimmed);
    
    // VS Code: increase indent for opening brackets
    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      indentLevel++;
    }
  }
  
  // VS Code: clean output
  return formatted.join('\n').replace(/\n\s*\n/g, '\n').trim();
};

module.exports = formatJSON;