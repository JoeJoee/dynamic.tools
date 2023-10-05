const pino = require('pino');
const os = require('os');

const logger = pino({
  base: { pid: process.pid, hostname: os.hostname() },
  redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers.cookie', 'res.headers.authorization'],
  level: process.env.LOG_LEVEL || 'info',
});

module.exports = logger;
