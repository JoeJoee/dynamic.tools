const expressPino = require('express-pino-logger');
const pino = require('pino');
const logger = require('../services/logger');

function requestSerializer(req) {
  const result = pino.stdSerializers.req(req);

  return result;
}

const requestLogger = expressPino({
  logger,
  serializers: {
    req: requestSerializer,
  },
});

module.exports = {
  requestLogger,
  requestSerializer,
};
