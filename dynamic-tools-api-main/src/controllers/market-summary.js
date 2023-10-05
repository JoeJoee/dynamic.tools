const { Router } = require('express');
const marketSummaryService = require('../services/market-summary');

const router = Router({ mergeParams: true });
const marketSummaryController = router;

router.get('/', (_, res, next) => {
  marketSummaryService
    .getMarketSummary()
    .then(async (result) => {
      return res.json({ result });
    })
    .catch(next);
});

module.exports = marketSummaryController;
