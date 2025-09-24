const formatHTML = (code, config) => {
  // Normalize whitespace - VS Code style
  code = code.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  
  const lines = [];
  let indentLevel = 0;
  
  // VS Code HTML self-closing tags
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
                          'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  
  // VS Code treats these as inline when they contain only text
  const inlineElements = ['a', 'span', 'strong', 'em', 'b', 'i', 'u', 'small', 
                         'code', 'kbd', 'sub', 'sup', 'mark', 'del', 'ins', 'title'];
  
  // Split by tags while preserving them
  const parts = code.split(/(<[^>]+>)/g).filter(part => part.trim());
  
  let i = 0;
  while (i < parts.length) {
    const part = parts[i].trim();
    if (!part) {
      i++;
      continue;
    }
    
    if (part.startsWith('</')) {
      // Closing tag - VS Code style
      indentLevel = Math.max(0, indentLevel - 1);
      const tagName = part.match(/<\/(\w+)/)?.[1]?.toLowerCase();
      
      // VS Code: inline elements with simple text content stay on same line
      const isInline = tagName && inlineElements.includes(tagName);
      const prevPart = i > 0 ? parts[i - 1]?.trim() : '';
      const hasSimpleTextContent = prevPart && !prevPart.startsWith('<') && 
                                   prevPart.length < 50 && !prevPart.includes('\n');
      
      if (isInline && hasSimpleTextContent && lines.length > 0) {
        lines[lines.length - 1] += part;
      } else {
        lines.push(config.indent.repeat(indentLevel) + part);
      }
    } 
    else if (part.startsWith('<')) {
      // Opening, self-closing, or special tag
      const isSelfClosing = part.endsWith('/>') || 
        selfClosingTags.some(tag => new RegExp(`^<${tag}\\b[^>]*>$`, 'i').test(part));
      const isComment = part.startsWith('<!--');
      const isDoctype = part.toLowerCase().startsWith('<!doctype');
      const isScript = part.toLowerCase().startsWith('<script');
      const isStyle = part.toLowerCase().startsWith('<style');
      
      const tagName = part.match(/<(\w+)/)?.[1]?.toLowerCase();
      const isInline = tagName && inlineElements.includes(tagName);
      
      // Check if next part is simple text content
      const nextPart = i < parts.length - 1 ? parts[i + 1]?.trim() : '';
      const hasSimpleTextContent = nextPart && !nextPart.startsWith('<') && 
                                   nextPart.length < 50 && !nextPart.includes('\n');
      
      // VS Code: inline elements with simple text content on same line
      if (isInline && hasSimpleTextContent) {
        lines.push(config.indent.repeat(indentLevel) + part + nextPart);
        i += 2; // Skip the text part
        if (!isSelfClosing) {
          indentLevel++;
        }
        continue;
      } else {
        lines.push(config.indent.repeat(indentLevel) + part);
        
        // VS Code: don't indent script/style content
        if (!isSelfClosing && !isComment && !isDoctype) {
          indentLevel++;
        }
      }
    } 
    else {
      // Text content - VS Code handles this cleanly
      const textLines = part.split('\n').map(line => line.trim()).filter(line => line);
      textLines.forEach(textLine => {
        lines.push(config.indent.repeat(indentLevel) + textLine);
      });
    }
    
    i++;
  }
  
  // VS Code style: clean up spacing
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    result.push(line);
    
    // VS Code: minimal blank lines, only after major block elements
    if (trimmedLine.startsWith('</html>') || 
        trimmedLine.startsWith('</head>') || 
        trimmedLine.startsWith('</body>')) {
      const nextLine = i < lines.length - 1 ? lines[i + 1] : null;
      if (nextLine && nextLine.trim() && !nextLine.trim().startsWith('</')) {
        result.push('');
      }
    }
  }
  
  // VS Code: clean ending, no excessive blank lines
  return result.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
};

module.exports = formatHTML;