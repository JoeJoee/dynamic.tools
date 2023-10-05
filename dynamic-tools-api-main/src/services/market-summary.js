const MarketSummary = require('../models/market-summary');

class MarketSummaryService {
  async init() {
    // Create the market summary DB record if it does not exist yet
    const records = await MarketSummary.find({});

    if (!records || !records.length) {
      await MarketSummary.create({});
    }
  }

  async getMarketSummary() {
    const records = await MarketSummary.find({});

    if (records && records.length) {
      return records[0];
    }

    return MarketSummary.create({});
  }

  async updateMarketSummary(data = {}) {
    const records = await MarketSummary.find({});

    if (!records || !records.length) {
      await MarketSummary.create({});
    }

    await MarketSummary.updateMany({}, data);
  }
}

const marketSummaryService = new MarketSummaryService();

module.exports = marketSummaryService;
