module.exports = function processPaginateOptions(query) {
  const paginateOptions = {};
  const filters = ['select', 'populate'];
  const pagination = ['offset', 'page', 'limit', 'perPage'];

  filters.forEach((prop) => {
    paginateOptions[prop] = query[prop];
    delete query[prop];
  });

  if (query.sortKey) {
    paginateOptions.sort = {
      [query.sortKey]: query.sortDirection || 'asc',
    };
    delete query.sortDirection;
    delete query.sortKey;
  }

  if (query.search) {
    query.name = { $regex: new RegExp(`${query.search.toLowerCase()}`, 'i') };
    delete query.search;
  }

  pagination.forEach((prop) => {
    if (typeof query[prop] === 'string' || typeof query[prop] === 'number') {
      if (prop === 'perPage') {
        paginateOptions.limit = Number(query[prop]);
      }

      paginateOptions[prop] = Number(query[prop]);
    }

    delete query[prop];
  });

  return paginateOptions;
};
