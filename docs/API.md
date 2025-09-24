# API Documentation

## Endpoints

### POST /format
Format code with specified language and action.

**Request Body:**
```json
{
  "code": "function hello(){console.log('world')}",
  "language": "javascript",
  "action": "format"
}
```

**Response:**
```json
{
  "formatted": "function hello() {\n  console.log('world');\n}",
  "originalLength": 35,
  "formattedLength": 42,
  "processingTime": 15,
  "language": "javascript",
  "action": "format",
  "success": true
}
```

### GET /languages
Get supported languages and actions.

**Response:**
```json
{
  "supported": ["javascript", "typescript", "python", "java", "cpp", "php", "sql", "json", "css", "html", "xml", "yaml"],
  "actions": ["format"],
  "maxCodeLength": 100000
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2023-12-01T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### GET /analytics
Get formatting analytics.

**Response:**
```json
{
  "totalRequests": 150,
  "languageUsage": {
    "javascript": 75,
    "python": 45,
    "json": 30
  },
  "actionUsage": {
    "format": 100,
    "beautify": 30,
  },
  "averageProcessingTime": 25.5,
  "uptime": 3600,
  "memoryUsage": {
    "rss": 45678912,
    "heapTotal": 12345678,
    "heapUsed": 8765432
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "success": false
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (endpoint doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error