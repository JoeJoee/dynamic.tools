const { Router } = require('express');
const Collection = require('../models/collection');
const CollectionTradingHistory = require('../models/collection-trading-history');

const router = Router({ mergeParams: true });
const tradingFeedController = router;

// By default, we collect the information only for the 60 minutes time intervals
const supportedResolutions = ['60'];

// Send the basic configuration params for the whole trading feed
router.get('/config', (req, res) => {
  return res.json({
    supported_resolutions: supportedResolutions,
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false,
  });
});

// Send the basic configuration params for the given collection slug
router.get('/symbols', (req, res) => {
  const symbolName = req.query.symbol;

  return res.json({
    name: symbolName,
    description: symbolName,
    exchange: 'OpenSea',
    listed_exchange: 'OpenSea',
    timezone: 'Etc/UTC',
    format: 'price',
    supported_resolutions: supportedResolutions,
    currency_code: 'ETH',
    has_intraday: true,
    pricescale: 100,
    pointvalue: 1,
    minmov2: 0,
    minmov: 1,
    numeric_formatting: { decimal_sign: ',' },
  });
});

// Get the trading feed data for building the graph with candles and volume line
router.get('/history', async (req, res) => {
  const { symbol, from, to } = req.query;

  try {
    const collection = await Collection.findOne({ slug: symbol }).select({ slug: 1 }).lean();

    if (!collection) {
      return res.json({ s: 'no_data' });
    }

    const startTs = new Date(from * 1000);
    const endTs = new Date(to * 1000);

    const tradingHistoryItems = await CollectionTradingHistory.find({
      collectionSlug: symbol,
      timestamp: {
        $gte: startTs,
        $lte: endTs,
      },
    })
      .sort({
        timestamp: 'asc',
      })
      .lean();

    if (!tradingHistoryItems || !tradingHistoryItems.length) {
      return res.json({ s: 'no_data' });
    }

    const toReturn = {
      s: 'ok',
      t: [],
      c: [],
      o: [],
      h: [],
      l: [],
      v: [],
    };

    tradingHistoryItems.forEach((item) => {
      toReturn.t.push(Math.floor(item.timestamp.getTime() / 1000));

      if (item.openFloorPrice && item.openFloorPrice.ethereum) {
        toReturn.o.push(item.openFloorPrice.ethereum);
      } else {
        toReturn.o.push(0);
      }

      if (item.closeFloorPrice && item.closeFloorPrice.ethereum) {
        toReturn.c.push(item.closeFloorPrice.ethereum);
      } else {
        toReturn.c.push(0);
      }

      if (item.lowFloorPrice && item.lowFloorPrice.ethereum) {
        toReturn.l.push(item.lowFloorPrice.ethereum);
      } else {
        toReturn.l.push(0);
      }

      if (item.highFloorPrice && item.highFloorPrice.ethereum) {
        toReturn.h.push(item.highFloorPrice.ethereum);
      } else {
        toReturn.h.push(0);
      }

      if (item.volume && item.volume.ethereum) {
        toReturn.v.push(item.volume.ethereum);
      } else {
        toReturn.v.push(0);
      }
    });

    return res.json(toReturn);
  } catch (e) {
    console.error(e);

    return res.json({ s: 'error' });
  }
});

module.exports = tradingFeedController;
