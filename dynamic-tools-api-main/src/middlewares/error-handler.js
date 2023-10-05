function developmentErrorHandler(err, req, res, next) {
  const { statusCode, payload } = err.output;
  req.log.error({ statusCode, message: err.stack });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({ ...payload, stack: err.stack, errors: err.errors });
}

function productionErrorHandler(err, req, res, next) {
  const { statusCode, payload } = err.output;
  req.log.error({ statusCode, message: err.stack });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({ payload, errors: err.errors });
}

const errorHandler = process.env.NODE_ENV === 'development' ? developmentErrorHandler : productionErrorHandler;

module.exports = {
  developmentErrorHandler,
  productionErrorHandler,
  errorHandler,
};
