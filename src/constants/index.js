const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 
  'json', 'css', 'html'
];

const ACTIONS = ['format', 'beautify', 'minify'];

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const MESSAGES = {
  ENDPOINT_NOT_FOUND: 'Endpoint not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',
  INVALID_REQUEST: 'Invalid request parameters'
};

module.exports = {
  SUPPORTED_LANGUAGES,
  ACTIONS,
  HTTP_STATUS,
  MESSAGES
};