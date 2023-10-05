const { Router } = require('express');
const Collection = require('../models/collection');
const CollectionNote = require('../models/collection-note');
const CollectionWatchlist = require('../models/collection-watchlist');
const AssetEvent = require('../models/asset-event');
const { NotFoundError } = require('../services/errors');
const processPaginateOptions = require('../services/query-helper');

const router = Router({ mergeParams: true });
const collectionController = router;

router.get('/', async (req, res, next) => {
  const query = req.query;
  const paginateOptions = processPaginateOptions(query);

  if (!paginateOptions.sort) {
    paginateOptions.sort = { 'stats.totalVolume': 'desc' };
  }

  const walletAddress = query.walletAddress;
  delete query.walletAddress;

  if (query.own === 'true') {
    query.editors = { $all: [query.walletAddress] };
    delete query.own;
  }

  Object.assign(query, {
    'stats.totalVolume': { $gt: 2000 },
    lastStatsPopulatedTime: { $exists: true },
  });

  try {
    const result = await Collection.paginate(query, {
      ...paginateOptions,
      lean: true,
    });

    const collectionIds = result.docs.map((doc) => doc._id);
    const watchlistItems = await CollectionWatchlist.find({
      collectionData: { $in: collectionIds },
      walletAddress,
    }).lean();

    result.docs = result.docs.map((doc) => ({
      ...doc,
      addedToWatchlist: !!watchlistItems.find((item) => item.collectionData.toString() === doc._id.toString()),
    }));

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/watchlist', async (req, res, next) => {
  const query = req.query;

  const { walletAddress } = query;

  if (!walletAddress) {
    return res.status(400).json({
      ok: false,
      message: 'missing_wallet_address',
    });
  }

  const paginateOptions = processPaginateOptions(query);
  paginateOptions.sort = { 'collectionData.stats.totalVolume': 'desc' };

  try {
    const result = await CollectionWatchlist.paginate(query, {
      ...paginateOptions,
      lean: true,
      populate: ['collectionData'],
    });

    result.docs = result.docs.map((doc) => doc.collectionData);

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  try {
    const result = await Collection.findOne({ slug }).lean();

    if (result === null) {
      throw new NotFoundError('collection_not_found');
    }

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:slug/notes', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  const query = req.query;
  const paginateOptions = processPaginateOptions(query);

  try {
    const collection = await Collection.findOne({ slug }).lean();

    if (collection === null) {
      throw new NotFoundError('collection_not_found');
    }

    query.collectionSlug = slug;

    const result = await CollectionNote.paginate(query, paginateOptions);

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:slug/notes', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  if (!req.body) {
    return res.status(400).json({
      ok: false,
      message: 'missing_note_details',
    });
  }

  const { title, text, walletAddress } = req.body;

  if (!title || !text || !walletAddress) {
    return res.status(400).json({
      ok: false,
      message: 'missing_note_details',
    });
  }

  try {
    const collection = await Collection.findOne({ slug }).lean();

    if (collection === null) {
      throw new NotFoundError('collection_not_found');
    }

    const newNote = await CollectionNote.create({
      title,
      text,
      collectionSlug: slug,
      walletAddress,
    });

    res.json({ ok: true, result: newNote });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:slug/watchlist', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  if (!req.body) {
    return res.status(400).json({
      ok: false,
      message: 'missing_watchlist_details',
    });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      ok: false,
      message: 'missing_wallet_address',
    });
  }

  try {
    const collection = await Collection.findOne({ slug }).lean();

    if (collection === null) {
      throw new NotFoundError('collection_not_found');
    }

    const existingWatchlistItem = await CollectionWatchlist.findOne({
      collectionData: collection._id,
      walletAddress,
    }).lean();

    if (existingWatchlistItem) {
      res.json({ ok: true, result: existingWatchlistItem });
    } else {
      const newWatchlistItem = await CollectionWatchlist.create({
        collectionData: collection._id,
        walletAddress,
      });

      res.json({ ok: true, result: newWatchlistItem });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:slug/watchlist', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({
      ok: false,
      message: 'missing_wallet_address',
    });
  }

  try {
    const collection = await Collection.findOne({ slug }).lean();

    if (collection === null) {
      throw new NotFoundError('collection_not_found');
    }

    const existingWatchlistItem = await CollectionWatchlist.findOne({
      collectionData: collection._id,
      walletAddress,
    }).lean();

    if (existingWatchlistItem) {
      await CollectionWatchlist.deleteOne({
        _id: existingWatchlistItem._id,
      });

      res.json({ ok: true });
    } else {
      res.json({ ok: true });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:slug/listings', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  const query = req.query;
  const paginateOptions = processPaginateOptions(query);
  paginateOptions.select = { id: 1, eventTimestamp: 1, price: 1, tokenId: 1, asset: 1 };

  try {
    const result = await AssetEvent.paginate(
      {
        ...query,
        collectionSlug: slug,
        eventType: 'created',
        listingCloseReason: { $exists: false },
        listingEndTime: { $exists: false },
        price: { $exists: true },
        lean: true,
      },
      paginateOptions
    );

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/:slug/sales', async (req, res, next) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({
      ok: false,
      message: 'missing_collection_slug',
    });
  }

  const query = req.query;
  const paginateOptions = processPaginateOptions(query);
  paginateOptions.select = { id: 1, eventTimestamp: 1, price: 1, tokenId: 1, asset: 1 };

  try {
    const result = await AssetEvent.paginate(
      {
        ...query,
        collectionSlug: slug,
        eventType: 'successful',
        price: { $exists: true },
        lean: true,
      },
      paginateOptions
    );

    res.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = collectionController;
