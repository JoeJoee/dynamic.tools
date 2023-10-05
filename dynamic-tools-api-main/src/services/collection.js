const moment = require('moment');
const _ = require('lodash');
const logger = require('./logger');
const Collection = require('../models/collection');
const AssetEvent = require('../models/asset-event');
const { IncorrectCurrencyApiError, IncorrectDurationCodeApiError, MissingCollectionSlugApiError } = require('./errors');

const { MIN_COLLECTION_VOLUME_TARGET = 2000 } = process.env;

const nftCollectionPageSize = 50;

const durationCodes = ['1m', '5m', '15m', '30m', '1h', '4h', '6h', '12h', '1d', '7d', '30d'];

const currentStatSlugs = {};

class CollectionService {
  // Get the amount of seconds for the given duration code
  getSecondDurationByCode(durationCode) {
    switch (durationCode) {
      case '1m':
        return 60;
      case '5m':
        return 5 * 60;
      case '15m':
        return 15 * 60;
      case '30m':
        return 30 * 60;
      case '1h':
        return 60 * 60;
      case '4h':
        return 4 * 60 * 60;
      case '6h':
        return 6 * 60 * 60;
      case '12h':
        return 12 * 60 * 60;
      case '1d':
        return 24 * 60 * 60;
      case '7d':
        return 7 * 24 * 60 * 60;
      case '30d':
        return 30 * 24 * 60 * 60;
      default:
        throw new IncorrectDurationCodeApiError(durationCode);
    }
  }

  // Get the range label for the given duration code
  getRangeLabelByDurationCode(durationCode) {
    switch (durationCode) {
      case '1m':
        return 'oneMinute';
      case '5m':
        return 'fiveMinute';
      case '15m':
        return 'fifteenMinute';
      case '30m':
        return 'thirtyMinute';
      case '1h':
        return 'oneHour';
      case '4h':
        return 'fourHour';
      case '6h':
        return 'sixHour';
      case '12h':
        return 'twelveHour';
      case '1d':
        return 'oneDay';
      case '7d':
        return 'sevenDay';
      case '30d':
        return 'thirtyDay';
      default:
        throw new IncorrectDurationCodeApiError(durationCode);
    }
  }

  // Get the start and end dates for the given duration code
  getTimeRangeForDurationCode(durationCode) {
    if (!durationCode) {
      throw new IncorrectDurationCodeApiError(durationCode);
    }

    const endTime = new Date();
    const secondsAmount = this.getSecondDurationByCode(durationCode);

    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() - secondsAmount);

    const prevStartTime = new Date();
    prevStartTime.setSeconds(prevStartTime.getSeconds() - 2 * secondsAmount);

    return {
      prevStartTime,
      startTime,
      endTime,
    };
  }

  // Calculate the change in percents between two values
  getStatChangeValue(prevValue, nextValue) {
    if (!_.isNumber(prevValue) && !_.isNumber(nextValue)) {
      return null;
    }

    if (prevValue) {
      return (((nextValue || 0) - prevValue) / prevValue) * 100;
    }

    return nextValue * 100;
  }

  // Get the collection time range sale stats for the given duration code
  async populateTimeRangeSaleData(collection, durationCode, saleEvents = [], listingEvents = [], currency = 'usd') {
    if (!collection) {
      throw new MissingCollectionSlugApiError();
    }

    if (!['usd', 'ethereum'].includes(currency)) {
      throw new IncorrectCurrencyApiError(currency);
    }

    if (!collection.stats) {
      collection.stats = {};
    }

    const { prevStartTime, startTime, endTime } = this.getTimeRangeForDurationCode(durationCode);

    const timeRanges = [
      {
        start: prevStartTime,
        end: startTime,
      },
      {
        start: startTime,
        end: endTime,
      },
    ];

    const saleValues = [];
    const floorPriceValues = [];
    const averageSalePriceValues = [];
    const volumeValues = [];

    for (let i = 0; i < timeRanges.length; i++) {
      const timeRange = timeRanges[i];

      // Get the related sale events
      const rangeSaleEvents = saleEvents.filter(
        (ev) =>
          ev.eventTimestamp.getTime() >= timeRange.start.getTime() &&
          ev.eventTimestamp.getTime() <= timeRange.end.getTime()
      );

      // Calculate sales, average sale price and volume data
      const sales = rangeSaleEvents.length;
      const averageSalePrice = rangeSaleEvents.length ? _.meanBy(rangeSaleEvents, `price.${currency}`) : null;
      const volume = rangeSaleEvents.length ? _.sumBy(rangeSaleEvents, `price.${currency}`) : 0;

      saleValues.push(sales);
      averageSalePriceValues.push(averageSalePrice);
      volumeValues.push(volume);

      // Get the listing events
      const rangeListingEvents = listingEvents.filter(
        (ev) =>
          ev.listingStartTime.getTime() <= timeRange.end.getTime() &&
          ev.listingExpireTime.getTime() >= timeRange.start.getTime() &&
          (!ev.listingEndTime || ev.listingEndTime.getTime() > timeRange.start.getTime())
      );

      const floorPriceItem = rangeListingEvents.length ? _.minBy(rangeListingEvents, `price.${currency}`) : null;
      const floorPrice = floorPriceItem ? floorPriceItem.price[currency] : null;
      floorPriceValues.push(floorPrice);
    }

    // Calculate the change values in percents
    const saleChange = this.getStatChangeValue(saleValues[0], saleValues[1]);
    const floorPriceChange = this.getStatChangeValue(floorPriceValues[0], floorPriceValues[1]);
    const averageSalePriceChange = this.getStatChangeValue(averageSalePriceValues[0], averageSalePriceValues[1]);
    const volumeChange = this.getStatChangeValue(volumeValues[0], volumeValues[1]);

    const rangeLabel = this.getRangeLabelByDurationCode(durationCode);

    Object.assign(collection.stats, {
      [`${rangeLabel}VolumeChange`]: volumeChange,
      [`${rangeLabel}FloorPrice`]: floorPriceValues[1],
      [`${rangeLabel}FloorPriceChange`]: floorPriceChange,
      [`${rangeLabel}SalesChange`]: saleChange,
      [`${rangeLabel}AveragePriceChange`]: averageSalePriceChange,
    });

    if (!['oneHour', 'sixHour', 'oneDay', 'thirtyDay'].includes(rangeLabel)) {
      Object.assign(collection.stats, {
        [`${rangeLabel}Volume`]: volumeValues[1],
        [`${rangeLabel}Sales`]: saleValues[1],
        [`${rangeLabel}AveragePrice`]: averageSalePriceValues[1],
      });
    }
  }

  // Get the collection aggregated week stats for the given duration code
  async populateWeekSaleData(collection, saleEvents = [], listingEvents = [], currency = 'usd') {
    if (!collection) {
      throw new MissingCollectionSlugApiError();
    }

    if (!['usd', 'ethereum'].includes(currency)) {
      throw new IncorrectCurrencyApiError(currency);
    }

    if (!collection.stats) {
      collection.stats = {};
    }

    // Get the volume stats for last 7 days
    const sevenDaysVolumes = [];
    const sevenDaysFloorPrices = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setHours(dayStart.getHours() - (6 - i));

      const dayEnd = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setHours(dayStart.getHours() - (5 - i));

      const daySaleEvents = saleEvents.filter(
        (ev) => ev.eventTimestamp.getTime() >= dayStart.getTime() && ev.eventTimestamp.getTime() <= dayEnd.getTime()
      );

      // Calculate the volume for given day
      const dayVolume = daySaleEvents.length ? _.sumBy(daySaleEvents, `price.${currency}`) : 0;
      sevenDaysVolumes.push(dayVolume);

      // Find the floor price for the given day
      const dayListingEvents = listingEvents.filter(
        (ev) =>
          ev.listingStartTime.getTime() <= dayEnd.getTime() &&
          ev.listingExpireTime.getTime() >= dayStart.getTime() &&
          (!ev.listingEndTime || ev.listingEndTime.getTime() > dayStart.getTime())
      );

      const floorPriceItem = dayListingEvents.length ? _.minBy(dayListingEvents, `price.${currency}`) : null;
      const floorPrice = floorPriceItem ? floorPriceItem.price[currency] : null;
      sevenDaysFloorPrices.push(floorPrice);
    }

    Object.assign(collection.stats, {
      sevenDaysVolumes,
      sevenDaysFloorPrices,
    });
  }

  async populateSingleCollectionStats(collection) {
    logger.debug(`CollectionService populateSingleCollectionStats(): Started for ${collection.slug}`);

    try {
      const { startTime, endTime } = this.getTimeRangeForDurationCode('30d');

      const saleEvents = await AssetEvent.find({
        collectionSlug: collection.slug,
        eventType: 'successful',
        eventTimestamp: {
          $gte: startTime,
          $lte: endTime,
        },
        price: {
          $exists: true,
        },
      })
        .select({
          id: 1,
          price: 1,
          listingStartTime: 1,
          listingEndTime: 1,
          listingExpireTime: 1,
          eventTimestamp: 1,
        })
        .lean();

      const listingEvents = await AssetEvent.find({
        collectionSlug: collection.slug,
        eventType: 'created',
        price: {
          $exists: true,
        },
        listingStartTime: { $lte: endTime },
        listingExpireTime: { $gte: startTime },
        $or: [
          {
            listingEndTime: { $exists: false },
          },
          {
            listingEndTime: { $gt: startTime },
          },
        ],
      })
        .select({
          id: 1,
          price: 1,
          listingStartTime: 1,
          listingEndTime: 1,
          listingExpireTime: 1,
          eventTimestamp: 1,
        })
        .lean();

      for (let i = 0; i < durationCodes.length; i++) {
        const code = durationCodes[i];

        try {
          await this.populateTimeRangeSaleData(collection, code, saleEvents, listingEvents);
        } catch (e) {
          console.error(e);
        }
      }

      await this.populateWeekSaleData(collection, saleEvents, listingEvents);

      collection.lastStatsPopulatedTime = new Date();

      const currentListingEvents = listingEvents.filter((ev) => !ev.listingEndTime);
      // const uniqueListingEvents = _.uniqBy(currentListingEvents, 'tokenId');

      collection.stats.listingCount = currentListingEvents.length;

      const floorPriceItem = currentListingEvents.length ? _.minBy(currentListingEvents, 'price.usd') : null;
      const floorPrice = floorPriceItem ? floorPriceItem.price.usd : null;

      collection.stats.floorPrice = floorPrice;

      await Collection.updateOne({ slug: collection.slug }, _.pick(collection, ['stats', 'lastStatsPopulatedTime']));
    } catch (e) {
      console.error(e);
    }

    logger.debug('CollectionService populateSingleCollectionStats(): Finished execution');
  }

  // Refresh the list stats for the top volume collections
  async refreshTopCollectionListStats() {
    logger.debug('CollectionService refreshTopCollectionListStats(): Started');

    try {
      const allCollectionsToBeHandled = [];

      const topCollectionsByVolume = await Collection.find({
        lastCollectedEventDate: { $exists: true },
        'stats.totalVolume': { $gt: MIN_COLLECTION_VOLUME_TARGET },
      })
        .sort({ 'stats.totalVolume': -1 })
        .select({
          slug: 1,
          stats: 1,
        })
        .lean();

      allCollectionsToBeHandled.push(...topCollectionsByVolume);
      const uniqueCollections = _.uniqBy(allCollectionsToBeHandled, 'slug');

      logger.debug(`CollectionService refreshTopCollectionListStats(): Handling ${uniqueCollections.length} slugs`);

      await this.populateCollectionListStats(uniqueCollections);
    } catch (e) {
      console.error(e);
    }

    logger.debug('CollectionService refreshTopCollectionListStats(): Finished execution');
  }

  // Populate the stats for the collection
  async populateCollectionListStats(collections) {
    logger.debug('CollectionService populateCollectionListStats(): Started');

    try {
      const filteredCollections = collections.filter((c) => !currentStatSlugs[c.slug]);

      for (let i = 0; i < filteredCollections.length; i++) {
        currentStatSlugs[filteredCollections[i].slug] = true;
      }

      for (let i = 0; i < filteredCollections.length; i++) {
        try {
          const collection = filteredCollections[i];

          await this.populateSingleCollectionStats(collection).finally(() => {
            currentStatSlugs[collection.slug] = false;
          });
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }

    logger.debug('CollectionService populateCollectionListStats(): Finished execution');
  }

  // Populate the collection stats for all collections
  async populateAllCollectionStats() {
    logger.debug('CollectionService populateAllCollectionStats(): Started');

    if (this.isCollectionStatAlgorithmInProgress) {
      logger.debug('CollectionService populateAllCollectionStats(): Refresh is already in progress');

      return;
    }

    try {
      this.isCollectionStatAlgorithmInProgress = true;

      const collectionQuery = { lastCollectedEventDate: { $exists: true } };

      const collectionCount = await Collection.count(collectionQuery);
      let collectionOffset = 0;

      while (collectionOffset < collectionCount + nftCollectionPageSize) {
        // Get the collection chunk from DB
        const collections = await Collection.find(collectionQuery)
          .sort({ 'stats.totalVolume': -1 })
          .skip(collectionOffset)
          .limit(nftCollectionPageSize)
          .select({
            slug: 1,
            stats: 1,
          })
          .lean();

        await this.populateCollectionListStats(collections);

        collectionOffset += nftCollectionPageSize;
      }
    } catch (e) {
      console.error(e);
    }

    this.isCollectionStatAlgorithmInProgress = false;

    logger.debug('CollectionService populateAllCollectionStats(): Finished execution');
  }
}

const collectionService = new CollectionService();

module.exports = collectionService;
