# Project Structure

```
Indentron/
├── config/
│   ├── ai-config.js                # AI service configuration
│   └── config.js                   # Application configuration
├── docs/
│   └── API.md                      # API documentation
├── public/
│   └── index.html                  # Frontend with VS Code theme
├── src/
│   ├── constants/
│   │   └── index.js                # Application constants
│   ├── controllers/
│   │   └── FormatController.js     # Request handling logic
│   ├── middleware/
│   │   ├── rateLimiter.js          # Rate limiting middleware
│   │   └── validation.js           # Request validation
│   ├── routes/
│   │   ├── formatRoutes.js         # Format-related routes
│   │   ├── healthRoutes.js         # Health check routes
│   │   └── index.js                # Main router
│   ├── services/
│   │   ├── AIFormatterService.js   # AI-powered formatting
│   │   ├── AnalyticsService.js     # Usage analytics
│   │   └── FormatterService.js     # Core formatting algorithms
│   ├── utils/
│   │   ├── formatUtils.js          # Formatting utilities
│   │   └── logger.js               # Logging utility
│   └── app.js                      # Express app configuration
├── tests/
│   └── formatter.test.js           # Test suite
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── CONTRIBUTING.md                 # Contribution guidelines
├── LICENSE                         # MIT license
├── package.json                    # Dependencies and scripts
├── README.md                       # Project documentation
├── server.js                       # Express server entry point
├── STRUCTURE.md                    # This file
└── vercel.json                     # Vercel deployment config
```

## Architecture Overview

- **MVC Pattern**: Controllers handle requests, services contain business logic
- **Modular Design**: Separated concerns for better maintainability
- **Configuration Management**: Centralized settings in config folder
- **Professional Logging**: Structured logging with timestamps
- **API Documentation**: Complete endpoint documentation
- **AI Integration**: Optional OpenAI integration for enhanced formatting
- **Rate Limiting**: Protection against abuse
- **Analytics**: Usage tracking and statistics