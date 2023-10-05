const mongoose = require('mongoose');
const collectionWatchlistSchema = require('../schemas/collection-watchlist');

const collectionWatchlist = mongoose.model(
  'CollectionWatchlist',
  collectionWatchlistSchema,
  'nft-collection-watchlist'
);

module.exports = collectionWatchlist;
