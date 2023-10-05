const boom = require('@hapi/boom');
const {
  DuplicateError,
  NotFoundError,
  RestrictedAccessError,
  MissingConfigurationParameter,
} = require('../services/errors');

function isBoomError(err) {
  return err.isBoom;
}

function isUnauthorizedError(err) {
  return !!err.status;
}

function isNotFoundError(err) {
  return err.name === 'ValidationError' || err instanceof NotFoundError;
}

function isBadRequestError(err) {
  return err instanceof DuplicateError;
}

function isForbiddenRequestError(err) {
  return err instanceof RestrictedAccessError;
}

function isMissingConfigurationParameterError(err) {
  return err instanceof MissingConfigurationParameter;
}

/**
 * Boomify the error object while attempting to grab a meaningful status code from different sources
 * @param err The error object to boomify
 * @param req The request
 * @param res The response
 * @param next The next middleware function
 */
function boomify(err, req, res, next) {
  if (isBoomError(err)) {
    return next(err);
  }

  if (isUnauthorizedError(err)) {
    return next(boom.boomify(err, { statusCode: err.status }));
  }

  if (isBadRequestError(err)) {
    return next(boom.boomify(err, { statusCode: 400 }));
  }

  if (isNotFoundError(err)) {
    return next(boom.boomify(err, { statusCode: 404 }));
  }

  if (isForbiddenRequestError(err)) {
    return next(boom.boomify(err, { statusCode: 403 }));
  }

  if (isMissingConfigurationParameterError(err)) {
    return next(boom.boomify(err, { statusCode: 500 }));
  }

  return next(boom.boomify(err));
}

module.exports = boomify;
