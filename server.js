require('dotenv').config();
const app = require('./src/app');
const Logger = require('./src/utils/logger');
const config = require('./config/config');

app.listen(config.port, () => {
  Logger.info(`Smart Code Formatter running on http://localhost:${config.port}`);
  Logger.info(`deployed in vercel link :  https://indentron.vercel.app/`);
});

module.exports = app;