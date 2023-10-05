const defaultOptions = {
  fields: [],
};

function numberQueryParams(userOptions = { fields: [] }) {
  const options = { ...defaultOptions, ...userOptions };

  return ({ query }, res, next) => {
    if (!query) {
      return next();
    }

    options.fields.forEach((field) => {
      const val = parseInt(query[field], 10);
      query[field] = Number.isNaN(val) ? undefined : val;
    });

    return next();
  };
}

module.exports = numberQueryParams;
