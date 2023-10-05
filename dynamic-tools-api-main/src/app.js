const bodyParser = require('body-parser');
require('colors');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const coreController = require('./controllers/core');
const userController = require('./controllers/user');
const collectionController = require('./controllers/collection');
const marketSummaryController = require('./controllers/market-summary');
const tradingFeedController = require('./controllers/trading-feed');
const noteController = require('./controllers/note');

const boomify = require('./middlewares/boomify');
const { errorHandler } = require('./middlewares/error-handler');
const jwtErrorHandler = require('./middlewares/authentication');
const numberQueryParams = require('./middlewares/number-query-params');
const { requestLogger } = require('./middlewares/request-logger');
const myQueryParams = require('./middlewares/my-query-params');
const applicationInfoService = require('./services/application-info');
const marketSummaryService = require('./services/market-summary');
const logger = require('./services/logger');
const cronService = require('./services/cron');
const ethereumService = require('./services/ethereum');
const priceService = require('./services/price');

const { ENABLE_CRON_JOBS } = process.env;

let areServicesInitialized = false;

const {
  API_PREFIX = '',
  DB_URL = '',
  DB_NAME = '',
  DB_ENV = 'development',
  NODE_ENV = 'development',
  SENTRY_DSN = '',
} = process.env;

async function startServices() {
  if (process.env.NODE_ENV !== 'test') {
    await marketSummaryService.init();
    await applicationInfoService.init();

    ethereumService.updateBlockNumberInfo();
    priceService.refreshPriceData();

    const runCronJobs = ENABLE_CRON_JOBS === 'true';

    if (runCronJobs) {
      cronService.init();
    }
  }

  areServicesInitialized = true;
}

/**
 * Apply the request middlewares to the specified express application
 * @param app the express application
 * @param prefix the api url prefix
 */
function applyRequestMiddleWares(app, prefix, nodeEnv) {
  if (nodeEnv === 'development') {
    app.use(cors());
  }

  app.use(requestLogger);
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(myQueryParams({ blacklistParams: ['limit', 'page', 'select', 'sort', 'perPage'] }));
  app.use(numberQueryParams({ fields: ['limit', 'page', 'perPage'] }));
  app.use(Sentry.Handlers.errorHandler());
  app.use(prefix, jwtErrorHandler);
}

/**
 * Apply the routes to the specified express application
 * @param app the express application
 * @param prefix the api url prefix
 */
function applyRoutes(app, prefix) {
  app.use(coreController);
  app.use(`${prefix}/users`, userController);
  app.use(`${prefix}/collections`, collectionController);
  app.use(`${prefix}/market-summary`, marketSummaryController);
  app.use(`${prefix}/trading-feed`, tradingFeedController);
  app.use(`${prefix}/notes`, noteController);
  // The 404 Route (ALWAYS Keep this as the last route)
  app.get('*', (req, res) => res.status(404).send('Not Found ¯\\_(ツ)_/¯'));
}

/**
 * Apply the response middlewares to the specified express application
 * @param app the express application
 */
function applyResponseMiddleWares(app) {
  app.use(boomify);
  app.use(errorHandler);
}

/**
 * Open the connection to MongoDB
 * @param url the MongoDB database url
 * @param dbName the MongoDB database name
 * @param dbEnv the database environment
 * @param nodeEnv the node environment
 */
function openDbConnection(url, dbName, dbEnv, nodeEnv) {
  if (nodeEnv === 'development') {
    logger.info(`Opening ${dbEnv} connection to MongoDB: ${url}/${dbName}`.cyan);
  }

  mongoose
    .connect(`${url}/${dbName}?retryWrites=true&authSource=admin`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => {
      logger.error({ msg: '💀 Mongoose connection error'.red, err });
      process.exit(1);
    });

  mongoose.set('debug', dbEnv === 'development');

  mongoose.connection.on('error', (err) => {
    logger.error({ msg: '💀 Mongoose connection error'.red, err });
    process.exit(1);
  });

  mongoose.connection.on('reconnectFailed', () => {
    logger.error({ msg: '💀 Mongoose too many reconnection failures'.red });
    process.exit(1);
  });

  mongoose.connection.on('connected', async () => {
    logger.info({ msg: '✔ Mongoose connection open'.green });

    if (!areServicesInitialized) {
      startServices();
    }
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn({ msg: '❌ Mongoose connection disconnected'.yellow });
  });

  process.on('SIGINT', () => {
    return mongoose.connection
      .close()
      .then(() => logger.info('✔ Mongoose connection disconnected through app termination'.green))
      .catch((err) => logger.error({ msg: '❌ Failed to close Mongoose connection'.red }, err))
      .finally(() => process.exit(0));
  });
}

const application = express();
application.disable('x-powered-by');

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app: application }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

application.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
application.use(Sentry.Handlers.tracingHandler());

application.get('/api/debug-sentry', () => {
  throw new Error('My first Sentry error!');
});

openDbConnection(DB_URL, DB_NAME, DB_ENV, NODE_ENV);
applyRequestMiddleWares(application, API_PREFIX, NODE_ENV);
applyRoutes(application, API_PREFIX);
applyResponseMiddleWares(application);

module.exports = application;
