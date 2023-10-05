const defaultOptions = {
  fields: ['createdBy'],
};

function forceUserIdQueryParams(userOptions = {}) {
  const options = { ...defaultOptions, ...userOptions };

  return ({ query, parsedQuery, user }, res, next) => {
    if (!query) {
      return next();
    }

    const userId = user ? user.sub : null;

    options.fields.forEach((field) => {
      query[field] = userId;
      parsedQuery[field] = userId;
    });

    return next();
  };
}

module.exports = forceUserIdQueryParams;
