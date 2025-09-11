class AnalyticsService {
  constructor() {
    this.stats = {
      totalRequests: 0,
      languageUsage: {},
      actionUsage: {},
      averageProcessingTime: 0,
      totalProcessingTime: 0
    };
  }

  recordRequest(language, action, processingTime) {
    this.stats.totalRequests++;
    this.stats.languageUsage[language] = (this.stats.languageUsage[language] || 0) + 1;
    this.stats.actionUsage[action] = (this.stats.actionUsage[action] || 0) + 1;
    this.stats.totalProcessingTime += processingTime;
    this.stats.averageProcessingTime = this.stats.totalProcessingTime / this.stats.totalRequests;
  }

  getStats() {
    return {
      ...this.stats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  getMostUsedLanguage() {
    return Object.keys(this.stats.languageUsage).reduce((a, b) => 
      this.stats.languageUsage[a] > this.stats.languageUsage[b] ? a : b, 'javascript'
    );
  }
}

module.exports = AnalyticsService;