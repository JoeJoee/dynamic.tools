const mongoose = require('mongoose');
const collectionTradingHistorySchema = require('../schemas/collection-trading-history');

const collectionTradingHistory = mongoose.model(
  'CollectionTradingHistory',
  collectionTradingHistorySchema,
  'nft-collection-trading-history'
);

module.exports = collectionTradingHistory;
