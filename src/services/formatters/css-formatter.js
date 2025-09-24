const formatCSS = (code, config) => {
  // Remove all extra whitespace first
  let formatted = code.replace(/\s+/g, ' ').trim();
  
  // Add newlines after opening braces
  formatted = formatted.replace(/{/g, ' {\n');
  // Add newlines after semicolons (except in media queries)
  formatted = formatted.replace(/;(?<!\s*})/g, ';\n');
  // Add newlines after closing braces
  formatted = formatted.replace(/}/g, '\n}\n');
  
  // Split into lines and format with proper indentation
  const lines = formatted.split('\n').filter(line => line.trim());
  const result = [];
  let indentLevel = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '}') {
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(config.indent.repeat(indentLevel) + trimmed);
    } else if (trimmed.endsWith('{')) {
      result.push(config.indent.repeat(indentLevel) + trimmed);
      indentLevel++;
    } else if (trimmed) {
      // CSS property
      const formattedProperty = trimmed.replace(/\s*:\s*/g, ': ');
      result.push(config.indent.repeat(indentLevel) + formattedProperty);
    }
  }
  
  return result.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n');
};

module.exports = formatCSS;