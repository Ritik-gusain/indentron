const formatJavaScript = require('./js-formatter');

const formatCStyle = (code, config, language = 'java') => {
  // Pre-process for VS Code C-style language formatting
  let processed = code;
  
  if (language === 'java') {
    // VS Code Java: Handle package and import statements
    processed = processed.replace(/^\s*package\s+/gm, 'package ');
    processed = processed.replace(/^\s*import\s+/gm, 'import ');
    
    // VS Code Java: Access modifiers spacing
    processed = processed.replace(/\s*(public|private|protected|static|final|abstract|synchronized)\s+/g, '$1 ');
    
    // VS Code Java: Generics formatting
    processed = processed.replace(/\s*<\s*/g, '<');
    processed = processed.replace(/\s*>\s*/g, '>');
    processed = processed.replace(/>\s*\(/g, '>(');
    
    // VS Code Java: Annotations
    processed = processed.replace(/@\w+(\([^)]*\))?\s*/g, (match) => match.trim() + '\n');
  }
  
  if (language === 'c#' || language === 'csharp') {
    // VS Code C#: Using statements
    processed = processed.replace(/^\s*using\s+/gm, 'using ');
    
    // VS Code C#: Access modifiers
    processed = processed.replace(/\s*(public|private|protected|internal|static|virtual|override|abstract|sealed)\s+/g, '$1 ');
    
    // VS Code C#: Properties
    processed = processed.replace(/\{\s*get;\s*set;\s*\}/g, ' { get; set; }');
    processed = processed.replace(/\{\s*get;\s*\}/g, ' { get; }');
    processed = processed.replace(/\{\s*set;\s*\}/g, ' { set; }');
    
    // VS Code C#: Lambda expressions
    processed = processed.replace(/=>\s*/g, ' => ');
  }
  
  if (language === 'c' || language === 'cpp' || language === 'c++') {
    // VS Code C/C++: Preprocessor directives
    processed = processed.replace(/#\s*include\s*/g, '#include ');
    processed = processed.replace(/#\s*define\s*/g, '#define ');
    processed = processed.replace(/#\s*(if|ifdef|ifndef|else|elif|endif)\s*/g, '#$1 ');
    
    // VS Code C/C++: Pointer and reference operators
    processed = processed.replace(/\*\s+(?=\w)/g, '* ');
    processed = processed.replace(/\s+\*/g, ' *');
    processed = processed.replace(/&\s+(?=\w)/g, '& ');
    processed = processed.replace(/\s+&(?=\w)/g, ' &');
    
    // VS Code C/C++: Scope resolution
    processed = processed.replace(/\s*::\s*/g, '::');
    
    // VS Code C++: Template syntax
    processed = processed.replace(/template\s*<\s*/g, 'template <');
    processed = processed.replace(/>\s*class\s+/g, '> class ');
    processed = processed.replace(/>\s*struct\s+/g, '> struct ');
  }
  
  // Apply JavaScript formatter (handles C-style syntax well)
  let formatted = formatJavaScript(processed, config, language);
  
  // Post-process for VS Code C-style specific formatting
  if (language === 'java') {
    // VS Code Java: Package statement formatting
    formatted = formatted.replace(/^(\s*)(package\s+[^;]+;)/gm, '$1$2\n');
    
    // VS Code Java: Import grouping
    formatted = formatted.replace(/^(\s*)(import\s+[^;]+;)/gm, '$1$2');
    formatted = formatted.replace(/(import\s+[^;]+;\n)(?=\s*(?!import))/g, '$1\n');
    
    // VS Code Java: Class declaration spacing
    formatted = formatted.replace(/^(\s*)(public\s+class|class)\s+/gm, '$1$2 ');
    
    // VS Code Java: Method spacing
    formatted = formatted.replace(/(@\w+(?:\([^)]*\))?)\s*\n\s*/g, '$1\n');
    
    // VS Code Java: Interface spacing
    formatted = formatted.replace(/^(\s*)(public\s+interface|interface)\s+/gm, '$1$2 ');
    
    // VS Code Java: Fix for loop formatting - keep on single line
    formatted = formatted.replace(/for\s*\(\s*([^;]+)\s*;\s*\n\s*([^;]+)\s*;\s*\n\s*([^)]+)\s*\)/g, 'for ($1; $2; $3)');
  }
  
  if (language === 'c#' || language === 'csharp') {
    // VS Code C#: Using statement grouping
    formatted = formatted.replace(/^(\s*)(using\s+[^;]+;)/gm, '$1$2');
    formatted = formatted.replace(/(using\s+[^;]+;\n)(?=\s*(?!using))/g, '$1\n');
    
    // VS Code C#: Namespace formatting
    formatted = formatted.replace(/^(\s*)(namespace\s+)/gm, '$1$2');
    
    // VS Code C#: Property formatting
    formatted = formatted.replace(/\s*\{\s*get;\s*set;\s*\}\s*/g, ' { get; set; }');
    
    // VS Code C#: Event formatting
    formatted = formatted.replace(/\s*\+=\s*/g, ' += ');
    formatted = formatted.replace(/\s*-=\s*/g, ' -= ');
    
    // VS Code C#: Fix for loop formatting - keep on single line
    formatted = formatted.replace(/for\s*\(\s*([^;]+)\s*;\s*\n\s*([^;]+)\s*;\s*\n\s*([^)]+)\s*\)/g, 'for ($1; $2; $3)');
  }
  
  if (language === 'c' || language === 'cpp' || language === 'c++') {
    // VS Code C/C++: Include grouping
    formatted = formatted.replace(/^(\s*)(#include\s+[<"][^>"]+[>"])/gm, '$1$2');
    formatted = formatted.replace(/(#include\s+[<"][^>"]+[>"]\n)(?=\s*(?!#include))/g, '$1\n');
    
    // VS Code C/C++: Function definition spacing
    formatted = formatted.replace(/^(\w+(?:\s+\w+)*\s+\*?\s*)\n(\w+\s*\([^)]*\)\s*\{)/gm, '$1\n$2');
    
    // VS Code C++: Template formatting
    formatted = formatted.replace(/template\s*<([^>]+)>\s*\n/g, 'template <$1>\n');
    
    // VS Code C/C++: Struct/class formatting
    formatted = formatted.replace(/^(\s*)(struct|class)\s+(\w+)\s*\{/gm, '$1$2 $3 {');
    
    // VS Code C/C++: Fix for loop formatting - keep on single line
    formatted = formatted.replace(/for\s*\(\s*([^;]+)\s*;\s*\n\s*([^;]+)\s*;\s*\n\s*([^)]+)\s*\)/g, 'for ($1; $2; $3)');
  }
  
  // VS Code: Final cleanup for all C-style languages
  formatted = formatted
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // VS Code: max double newlines
    .replace(/\s*\{\s*\n\s*\}/g, ' { }')  // VS Code: empty blocks on single line
    .replace(/;\s*\n\s*;/g, ';\n;')  // VS Code: clean semicolon spacing
    .trim();
  
  return formatted;
};

module.exports = formatCStyle;