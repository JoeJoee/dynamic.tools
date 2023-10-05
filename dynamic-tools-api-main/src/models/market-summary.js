const mongoose = require('mongoose');
const marketSummarySchema = require('../schemas/market-summary');

const marketSummary = mongoose.model('MarketSummary', marketSummarySchema, 'market-summary');

module.exports = marketSummary;
