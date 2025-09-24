const OpenAI = require('openai');

class AIFormatterService {
  constructor() {
    // Only initialize if API key exists
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;
    
    // Cache formatted results to reduce API calls
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  async enhanceFormatting(code, language) {
    if (!this.openai) {
      return null; // Fall back to standard formatting
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(code, language);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI timeout')), 5000)
      );
      
      const systemPrompt = this.getSystemPrompt(language);
      const userPrompt = this.getUserPrompt(code, language);

      const aiPromise = this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: Math.min(2000, code.length * 2),
        temperature: 0.1,
      });

      const completion = await Promise.race([aiPromise, timeoutPromise]);
      const formatted = completion.choices[0]?.message?.content?.trim();
      
      // Validate the response
      if (this.isValidFormattedCode(formatted, language)) {
        // Cache the result
        this.cache.set(cacheKey, {
          result: formatted,
          timestamp: Date.now()
        });
        return formatted;
      }
      
      return null; // Fall back to standard formatting
    } catch (error) {
      // Fail silently and quickly for quota/timeout errors
      return null; // Fall back to standard formatting
    }
  }

  getSystemPrompt(language) {
    const languageSpecific = {
      javascript: `You are a JavaScript code formatter. Format code following these rules:
- Use 2 spaces for indentation
- Use single quotes for strings (except template literals)
- Add semicolons at the end of statements
- Place opening braces on the same line
- Add spaces around operators
- Use consistent spacing in objects and arrays
- Preserve comments
- Follow ESLint standard style guide`,
      
      typescript: `You are a TypeScript code formatter. Format code following these rules:
- Use 2 spaces for indentation
- Use single quotes for strings (except template literals)
- Add semicolons at the end of statements
- Place opening braces on the same line
- Add spaces around operators and type annotations
- Keep type definitions readable
- Follow TypeScript style guide`,
      
      python: `You are a Python code formatter. Format code following PEP 8:
- Use 4 spaces for indentation
- Maximum line length of 79 characters
- Add spaces around operators
- Two blank lines between top-level functions/classes
- One blank line between methods
- Use snake_case for variables and functions
- Use UPPER_CASE for constants`,
      
      java: `You are a Java code formatter. Format code following these rules:
- Use 4 spaces for indentation
- Place opening braces on the same line (K&R style)
- Add spaces around operators
- One statement per line
- camelCase for variables and methods
- PascalCase for classes
- UPPER_CASE for constants`,
      
      css: `You are a CSS code formatter. Format code following these rules:
- Use 2 spaces for indentation
- One property per line
- Add space after colon in properties
- Semicolon after each property
- Opening brace on same line as selector
- Closing brace on new line`,
      
      html: `You are an HTML code formatter. Format code following these rules:
- Use 2 spaces for indentation
- Properly nest elements
- Self-closing tags for void elements
- Lowercase for tags and attributes
- Quote attribute values
- One element per line for readability`,
      
      json: `You are a JSON formatter. Format code following these rules:
- Use 2 spaces for indentation
- No trailing commas
- Consistent quote style (double quotes)
- Proper nesting
- One property per line`
    };

    return languageSpecific[language.toLowerCase()] || 
           `You are a code formatter. Format the provided ${language} code with proper indentation, spacing, and follow language-specific best practices. Return only the formatted code without any explanations or markdown formatting.`;
  }

  getUserPrompt(code, language) {
    return `Format this ${language} code. Return ONLY the formatted code, no explanations, no markdown code blocks, no additional text:\n\n${code}`;
  }

  isValidFormattedCode(formatted, language) {
    // Basic validation to ensure we got valid formatted code
    if (!formatted || formatted.length === 0) {
      return false;
    }
    
    // Check for common error messages
    const errorPhrases = [
      'i cannot', 'i can\'t', 'sorry', 'i apologize',
      'as an ai', 'i\'m unable', 'cannot provide',
      'here is the formatted', 'here\'s the formatted',
      '```', 'formatted code:', 'formatted version:'
    ];
    
    const lowerFormatted = formatted.toLowerCase();
    for (const phrase of errorPhrases) {
      if (lowerFormatted.includes(phrase)) {
        return false;
      }
    }
    
    // Language-specific validation
    switch (language.toLowerCase()) {
      case 'json':
        try {
          JSON.parse(formatted);
          return true;
        } catch {
          return false;
        }
      
      case 'javascript':
      case 'typescript':
        // Check for basic JS/TS structure
        return formatted.includes('{') || formatted.includes('function') || 
               formatted.includes('const') || formatted.includes('let') || 
               formatted.includes('var') || formatted.includes('class');
      
      case 'python':
        // Check for basic Python structure
        return formatted.includes('def ') || formatted.includes('class ') || 
               formatted.includes('import ') || formatted.includes('if ') ||
               formatted.includes('for ') || formatted.includes('while ');
      
      case 'html':
        // Check for basic HTML structure
        return formatted.includes('<') && formatted.includes('>');
      
      case 'css':
        // Check for basic CSS structure
        return formatted.includes('{') && formatted.includes('}') && 
               (formatted.includes(':') || formatted.includes(';'));
      
      default:
        // For other languages, just ensure it's not an error message
        return formatted.length > 10 && !lowerFormatted.includes('error');
    }
  }

  generateCacheKey(code, language) {
    // Create a simple hash for caching
    const str = `${language}:${code}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${language}_${hash}`;
  }

  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

module.exports = AIFormatterService;