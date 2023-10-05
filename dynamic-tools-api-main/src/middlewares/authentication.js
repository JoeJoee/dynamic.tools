const boom = require('@hapi/boom');

function jwtErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // catch & reformat actual 401 & 403.
  // Other UnauthorizedError are most likely configuration error and should handled as common errors
  if (err.name === 'UnauthorizedError') {
    if (err.code === 'credentials_required' || err.code === 'invalid_token') {
      return next(boom.unauthorized());
    }

    if (err.code === 'permission_denied') {
      return next(boom.forbidden());
    }
  }

  return next(err);
}

module.exports = jwtErrorHandler;
