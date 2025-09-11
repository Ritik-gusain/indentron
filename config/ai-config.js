module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.1,
  },
  fallbackToStandard: true,
  enableAIFormatting: !!process.env.OPENAI_API_KEY,
};