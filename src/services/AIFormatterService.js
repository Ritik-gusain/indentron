const OpenAI = require('openai');

class AIFormatterService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;
  }

  async enhanceFormatting(code, language) {
    if (!this.openai) {
      return null; // Fall back to standard formatting
    }

    try {
      const prompt = `Format this ${language} code with proper indentation, spacing, and best practices. Return only the formatted code without explanations:

${code}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a code formatter. Format the provided code with proper indentation, spacing, and follow language-specific best practices. Return only the formatted code without any explanations or markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      const formatted = completion.choices[0]?.message?.content?.trim();
      
      // Basic validation to ensure we got valid formatted code
      if (formatted && formatted.length > 0 && !formatted.includes('I cannot') && !formatted.includes('Sorry')) {
        return formatted;
      }
      
      return null; // Fall back to standard formatting
    } catch (error) {
      console.error('AI formatting error:', error);
      return null; // Fall back to standard formatting
    }
  }
}

module.exports = AIFormatterService;