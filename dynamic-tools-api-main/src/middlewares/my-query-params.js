const queryParams = require('express-query-params');

function myQueryParams({ blacklistParams } = { blacklistParams: [] }) {
  return (req, res, next) => {
    // express-query-params breaks on GET params that are arrays: blacklist them automatically.
    Object.entries(req.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        blacklistParams.push(key);
      }
    });

    return queryParams({ blacklistParams })(req, res, next);
  };
}

module.exports = myQueryParams;
