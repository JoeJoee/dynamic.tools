require('source-map-support/register');
require('colors');

const _ = require('lodash');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const app = require('./app');
const logger = require('./services/logger');

const { NODE_ENV, PORT, IP } = process.env;

function getServerAddress(srv) {
  const address = srv.address();
  if (!address) {
    return 'Unknown adress';
  }

  if (_.isString(address)) {
    if (address === '::') {
      return '127.0.0.1';
    }

    return address;
  }

  return `${address.address === '::' ? 'http:://127.0.0.1' : address.address}:${address.port}`;
}

logger.info(`Starting ${NODE_ENV} server...`.cyan);

const server = http.createServer(app);

server.listen(PORT, IP, () => {
  if (server.address()) {
    logger.info(`✔ Server listening at ${getServerAddress(server)}`.green);
  } else {
    logger.error(`💀 No server address. The port ${PORT} was most likely already in use`.red);
  }
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const address = getServerAddress(server);

  switch (error.code) {
    case 'EACCES':
      logger.error(`${address} requires elevated privileges`.red);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${address} is already in use`.red);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = server;
