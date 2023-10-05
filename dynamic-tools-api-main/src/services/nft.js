const _ = require('lodash');
const logger = require('./logger');
const openseaService = require('./opensea');
const { NftCollectionRefreshError } = require('./errors');

const Collection = require('../models/collection');
const Transaction = require('../models/transaction');
const AssetEvent = require('../models/asset-event');
const CollectionTradingHistory = require('../models/collection-trading-history');

const {
  MIN_COLLECTION_VOLUME_TARGET = 2000,
  NFT_MAX_OFFSET,
  NFT_PAGE_SIZE,
  NFT_EVENT_PAGE_SIZE,
  SAVE_ADDRESS_SPECIFIC_COLLECTIONS,
} = process.env;
const nftCollectionPageSize = NFT_PAGE_SIZE ? Number(NFT_PAGE_SIZE) : 300;
const nftEventPageSize = NFT_EVENT_PAGE_SIZE ? Number(NFT_EVENT_PAGE_SIZE) : 30;
const nftMaxOffset = NFT_MAX_OFFSET ? +NFT_MAX_OFFSET : 50000;

const invalidAddress = '0x0000000000000000000000000000000000000000';

const maxEventBatchCount = 3000;

const currentAssetEventSlugs = {};
const curentTradingHistorySlugs = {};

const statFieldsToCollect = [
  'marketCap',
  'totalSupply',
  'numOwners',
  'count',
  'totalSales',
  'averagePrice',
  'floorPrice',
  'totalVolume',
  'oneHourVolume',
  'oneHourSales',
  'oneHourAveragePrice',
  'sixHourVolume',
  'sixHourSales',
  'sixHourAveragePrice',
  'oneDayVolume',
  'oneDaySales',
  'oneDayAveragePrice',
  'sevenDayVolume',
  'sevenDaySales',
  'sevenDayAveragePrice',
  'thirtyDayVolume',
  'thirtyDaySales',
  'thirtyDayAveragePrice',
];

class NftService {
  // Start the collection refresh process
  async startCollectionRefreshProcess() {
    try {
      this.refreshCollectionData();
    } catch (err) {
      console.error('NftService startCollectionRefreshProcess(): Failed to refresh the collection data');
    }

    try {
      this.refreshCollectionForAddressList();
    } catch (err) {
      console.error(
        'NftService startCollectionRefreshProcess(): Failed to refresh the collection data for the address list'
      );
    }
  }

  // Retrieve the NFT collections for the owner address list
  async refreshCollectionForAddressList() {
    const runJob = SAVE_ADDRESS_SPECIFIC_COLLECTIONS === 'true';

    if (!runJob) {
      logger.debug(`NftService refreshCollectionForAddressList(): Job is disabled`);

      return;
    }

    logger.debug('NftService refreshCollectionForAddressList(): Started');

    if (this.isAddressRefreshInProgress) {
      logger.debug('NftService refreshCollectionForAddressList(): Refresh is already in progress');

      return;
    }

    try {
      this.isAddressRefreshInProgress = true;

      const totalTxnCount = await Transaction.count();

      let txnOffset = 0;
      const txnPageSize = 50;

      while (txnOffset < totalTxnCount + txnPageSize) {
        const existingTransactions = await Transaction.find()
          .skip(txnOffset)
          .limit(txnPageSize)
          .select({ transfers: 1 })
          .lean();

        let addresses = [];

        // Get the list of addresses that the algorithm will run for from the transaction transfer entries
        existingTransactions.forEach((txn) => {
          if (txn && txn.transfers) {
            txn.transfers.forEach((entry) => {
              if (entry.sellerAddress) {
                addresses.push(entry.sellerAddress);
              }

              if (entry.buyerAddress) {
                addresses.push(entry.buyerAddress);
              }
            });
          }
        });

        addresses = _.uniq(addresses);

        for (let i = 0; i < addresses.length; i++) {
          if (addresses[i] !== invalidAddress) {
            try {
              await this.refreshCollectionData(addresses[i]);
            } catch (e) {
              console.error(e);
            }
          }
        }

        txnOffset += txnPageSize;
      }
    } catch (e) {
      console.error(e);
    }

    this.isAddressRefreshInProgress = false;

    logger.debug('NftService refreshCollectionForAddressList(): Finished execution');
  }

  // Retrieve the NFT collection data from the Opensea service
  async refreshCollectionData(assetAddress) {
    const logSuffix = assetAddress ? `(Asset Address is ${assetAddress})` : 'MAIN process';

    if (!assetAddress && this.isCommonRefreshInProgress) {
      logger.debug(`NftService refreshCollectionData(): Refresh is already in progress, ${logSuffix}`);

      return;
    }

    logger.debug(`NftService refreshCollectionData(): Started, ${logSuffix}`);

    if (!assetAddress) {
      this.isCommonRefreshInProgress = true;
    }

    let offset = 0;
    let requestNextCollectionBunch = true;

    while (requestNextCollectionBunch) {
      let collectionList = [];
      const nftCollectionsToUpdate = [];
      const nftCollectionsToAdd = [];

      try {
        logger.debug(
          `NftService refreshCollectionData(): Requesting data for offset = ${offset} and page size = ${nftCollectionPageSize}, ${logSuffix}`
        );

        collectionList = await openseaService.getNftCollections(offset, nftCollectionPageSize, assetAddress);
        const newCollectionSlugList = collectionList.map((c) => c.slug).filter((v) => !!v);

        const existingNftCollections = await Collection.find({ slug: { $in: newCollectionSlugList } })
          .select({ slug: 1 })
          .lean();
        const existingSlugs = existingNftCollections.map((item) => item.slug);

        // Check whether the collection should be updated in DB or this is a new record
        collectionList.forEach((collectionItem) => {
          if (!collectionItem || !collectionItem.slug) {
            return;
          }

          if (existingSlugs.indexOf(collectionItem.slug) === -1) {
            nftCollectionsToAdd.push(collectionItem);
          } else {
            nftCollectionsToUpdate.push(collectionItem);
          }
        });
      } catch (e) {
        console.error(e);

        if (!assetAddress) {
          this.isCommonRefreshInProgress = false;
        }

        throw new NftCollectionRefreshError('api error');
      }

      if (!_.isArray(collectionList)) {
        if (!assetAddress) {
          this.isCommonRefreshInProgress = false;
        }

        throw new NftCollectionRefreshError('invalid api data');
      }

      logger.debug(
        `NftService refreshCollectionData(): Total ${collectionList.length} records; ${nftCollectionsToAdd.length} records to add; ${nftCollectionsToUpdate.length} records to update, ${logSuffix}`
      );

      // Save the new collections in DB
      await Collection.insertMany(nftCollectionsToAdd);

      // Update the collections in DB
      if (nftCollectionsToUpdate.length) {
        await Collection.bulkWrite(
          nftCollectionsToUpdate.map((updateItem) => {
            const statUpdates = {};

            statFieldsToCollect.forEach((fieldName) => {
              statUpdates[`stats.${fieldName}`] = updateItem.stats[fieldName];
            });

            return {
              updateOne: {
                filter: { slug: updateItem.slug },
                update: {
                  ..._.omit(updateItem, ['stats']),
                  ...statUpdates,
                },
              },
            };
          })
        );
      }

      if (collectionList.length < nftCollectionPageSize) {
        logger.debug(
          `NftService refreshCollectionData(): response array length is ${collectionList.length}, stopping the refresh process, ${logSuffix}`
        );
        requestNextCollectionBunch = false;
      }

      offset += nftCollectionPageSize;

      if (offset >= nftMaxOffset) {
        logger.debug(
          `NftService refreshCollectionData(): max offset value has been reached, stopping the refresh process, ${logSuffix}`
        );
        requestNextCollectionBunch = false;
      }
    }

    if (!assetAddress) {
      this.isCommonRefreshInProgress = false;
    }

    logger.debug(`NftService refreshCollectionData(): Finished execution, ${logSuffix}`);
  }

  // Retrieve the NFT collection data from the Opensea service for DB items
  async refreshExistingCollectionData() {
    if (this.isCollectionStatRefreshInProgress) {
      logger.debug('NftService refreshExistingCollectionData(): Refresh is already in progress');

      return;
    }

    logger.debug('NftService refreshExistingCollectionData(): Started');

    this.isCollectionStatRefreshInProgress = true;

    const count = await Collection.count();

    let offset = 0;

    while (offset < count + nftCollectionPageSize) {
      const collections = await Collection.find({
        'stats.totalVolume': { $gt: MIN_COLLECTION_VOLUME_TARGET },
      })
        .sort({ 'stats.totalVolume': -1 })
        .skip(offset)
        .limit(nftCollectionPageSize)
        .select({
          slug: 1,
        })
        .lean();

      await this.refreshExistingCollectionListData(collections);

      offset += nftCollectionPageSize;
    }

    this.isCollectionStatRefreshInProgress = false;

    logger.debug('NftService refreshExistingCollectionData(): Finished execution');
  }

  // Refresh the data for the collection list chunk
  async refreshExistingCollectionListData(collections) {
    logger.debug('NftService refreshExistingCollectionListData(): Started');

    try {
      const nftCollectionsToUpdate = [];

      for (let i = 0; i < collections.length; i++) {
        try {
          const collectionData = await openseaService.getNftCollection(collections[i].slug);

          if (collectionData) {
            nftCollectionsToUpdate.push(collectionData);
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (nftCollectionsToUpdate.length) {
        await Collection.bulkWrite(
          nftCollectionsToUpdate.map((updateItem) => {
            const statUpdates = {};

            statFieldsToCollect.forEach((fieldName) => {
              statUpdates[`stats.${fieldName}}`] = updateItem.stats[fieldName];
            });

            return {
              updateOne: {
                filter: { slug: updateItem.slug },
                update: {
                  ..._.omit(updateItem, ['stats']),
                  ...statUpdates,
                },
              },
            };
          })
        );
      }
    } catch (e) {
      console.error(e);
    }

    logger.debug('NftService refreshExistingCollectionListData(): Finished execution');
  }

  // Retrieve the asset events for the top volume collections
  async refreshTopCollectionAssetEventData() {
    logger.debug('NftService refreshTopCollectionAssetEventData(): Started');

    try {
      const allCollectionsToBeHandled = [];

      const topCollectionsByVolume = await Collection.find({
        disableHistoryCollection: { $ne: true },
        'stats.totalVolume': { $gt: MIN_COLLECTION_VOLUME_TARGET },
      })
        .sort({ 'stats.totalVolume': -1 })
        .select({
          slug: 1,
          lastCollectedEventDate: 1,
          lastTradingHistoryHandleTime: 1,
          lastStatsPopulatedTime: 1,
          assetEventCursor: 1,
          pendingLastCollectedEventDate: 1,
          pendingEventType: 1,
          stats: 1,
        })
        .lean();

      allCollectionsToBeHandled.push(...topCollectionsByVolume);

      const uniqueCollections = _.uniqBy(allCollectionsToBeHandled, 'slug');

      logger.debug(`NftService refreshAssetEventData(): Handling ${uniqueCollections.length} slugs`);

      await this.refreshAssetEventDataForCollectionList(uniqueCollections);
    } catch (e) {
      console.error(e);
    }

    logger.debug('NftService refreshTopCollectionAssetEventData(): Finished execution');
  }

  // Retrieve the asset events for the collections
  async refreshAllAssetEventData() {
    logger.debug('NftService refreshAllAssetEventData(): Started');

    if (this.isAssetEventRefreshInProgress) {
      return;
    }

    try {
      this.isAssetEventRefreshInProgress = true;

      const collectionCount = await Collection.count({
        disableHistoryCollection: { $ne: true },
      });
      let collectionOffset = 0;

      while (collectionOffset < collectionCount + nftEventPageSize) {
        // Get the collection chunk from DB
        const collections = await Collection.find({
          disableHistoryCollection: { $ne: true },
        })
          .sort({ 'stats.totalVolume': -1 })
          .skip(collectionOffset)
          .limit(nftEventPageSize)
          .select({
            slug: 1,
            lastCollectedEventDate: 1,
            lastTradingHistoryHandleTime: 1,
            lastStatsPopulatedTime: 1,
            assetEventCursor: 1,
            pendingLastCollectedEventDate: 1,
            pendingEventType: 1,
            stats: 1,
          })
          .lean();
        const collectionSlugs = collections.map((c) => c.slug);

        logger.debug(`NftService refreshAllAssetEventData(): Handling the slugs ${collectionSlugs}`);

        await this.refreshAssetEventDataForCollectionList(collections);

        collectionOffset += nftEventPageSize;
      }
    } catch (e) {
      console.error(e);
    }

    this.isAssetEventRefreshInProgress = false;

    logger.debug('NftService refreshAllAssetEventData(): Finished execution');
  }

  // Get the asset events for the given collection list
  async refreshAssetEventDataForCollectionList(collections) {
    logger.debug('NftService refreshAssetEventDataForCollectionList(): Started');

    try {
      const filteredCollections = collections.filter((c) => !currentAssetEventSlugs[c.slug]);

      for (let i = 0; i < filteredCollections.length; i++) {
        currentAssetEventSlugs[filteredCollections[i].slug] = true;
      }

      for (let i = 0; i < filteredCollections.length; i++) {
        try {
          const { lastCollectedEventDate, slug } = filteredCollections[i];

          const collectionProcessStartTime = lastCollectedEventDate ? new Date(lastCollectedEventDate) : null;

          if (collectionProcessStartTime) {
            collectionProcessStartTime.setMinutes(collectionProcessStartTime.getMinutes() - 1);
          }

          await this.getAssetEventsForSlug(filteredCollections[i], collectionProcessStartTime).finally(() => {
            currentAssetEventSlugs[slug] = false;
          });
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }

    logger.debug('NftService refreshAssetEventDataForCollectionList(): Finished execution');
  }

  // Get the asset events for the given collection slug,
  // occurredAfter can be specified if events need to be retrieved only if they happened after the given time
  async getAssetEventsForSlug(collection, occurredAfter) {
    const { slug, assetEventCursor, pendingLastCollectedEventDate, pendingEventType } = collection;
    logger.debug(
      `NftService getAssetEventsForSlug(): Started for ${slug},  occurredAfter = ${occurredAfter}; initial cursor: ${assetEventCursor}`
    );

    let lastCollectedEventDate = pendingLastCollectedEventDate;
    let isPendingCursorTaken = false;
    let eventCount = 0;

    const eventTypes = ['created', 'successful', 'cancelled'];

    for (let i = 0; i < eventTypes.length; i++) {
      const eventType = eventTypes[i];
      const pendingEventTypeIndex = eventTypes.indexOf(pendingEventType);

      if (pendingEventTypeIndex > i) {
        // eslint-disable-next-line no-continue
        continue;
      }

      let cursor;

      if (!isPendingCursorTaken) {
        cursor = assetEventCursor;
        isPendingCursorTaken = true;
      }

      let eventList = [];
      let retrieveNextChunk = true;

      while (retrieveNextChunk) {
        logger.debug(
          `NftService getAssetEventsForSlug(): Slug ${slug} and occurredAfter = ${occurredAfter}; new chunk started; current event amount: ${eventList.length}; total event count: ${eventCount}; eventType = ${eventType}`
        );

        // Get the event list from OpenSea via REST API (cursor must be passed for the pagination)
        let data;

        try {
          data = await openseaService.getAssetEvents(slug, eventType, nftCollectionPageSize, cursor, occurredAfter);
        } catch (e) {
          console.error(e);

          throw e;
        }

        if (!data || cursor === data.next) {
          retrieveNextChunk = false;
          // eslint-disable-next-line no-continue
          continue;
        }

        cursor = data.next;
        retrieveNextChunk = cursor !== null;

        const newEvents = data.asset_events || [];
        const newEventIds = newEvents.map((e) => e && e.id).filter((e) => !!e);

        // Get the list of event IDs that are already present in DB for given collection list
        const assetEvents = await AssetEvent.find({ collectionSlug: slug, id: { $in: newEventIds } })
          .select({ id: 1 })
          .lean();
        const assetEventIds = assetEvents.map((ev) => ev.id);

        const filteredEventList = newEvents.filter((e) => e && !!e.paymentToken && assetEventIds.indexOf(e.id) === -1);

        eventList.push(...filteredEventList);

        if (newEvents.length) {
          const lastEventDate =
            newEvents[0] && newEvents[0].eventTimestamp ? new Date(newEvents[0].eventTimestamp) : null;

          if (
            lastEventDate &&
            (!lastCollectedEventDate || lastEventDate.getTime() > lastCollectedEventDate.getTime())
          ) {
            lastCollectedEventDate = lastEventDate;
          }
        }

        if (eventList.length >= maxEventBatchCount || !retrieveNextChunk) {
          logger.debug(
            `NftService getAssetEventsForSlug(): Handling/saving ${eventList.length} new asset events for ${slug}`
          );

          // Handle the asset event list
          const finalEventList = await this.handleAssetEventList(eventList);
          eventCount += finalEventList.length;

          // Save new asset events to DB
          await AssetEvent.insertMany(finalEventList);

          if (retrieveNextChunk) {
            // Save the last pagination cursor, last "in progress" asset event type for the collection,
            // needed so that we don't start the collection process for the given collection from scratch
            // if some unexpected OpenSea error happened
            await Collection.updateOne(
              {
                slug,
              },
              {
                assetEventCursor: cursor,
                pendingLastCollectedEventDate: lastCollectedEventDate,
                pendingEventType: eventType,
              }
            );
          }

          if (retrieveNextChunk) {
            eventList = [];
          }
        }
      }
    }

    const collectionUpdates = {
      assetEventCursor: null,
      pendingLastCollectedEventDate: null,
      pendingEventType: null,
    };

    if (lastCollectedEventDate) {
      collectionUpdates.lastCollectedEventDate = lastCollectedEventDate;
    }

    await Collection.updateOne(
      {
        slug,
      },
      collectionUpdates
    );

    logger.debug(`NftService getAssetEventsForSlug(): Finished execution for ${slug}; retrieved ${eventCount} events`);
  }

  // Handle asset events before saving to DB
  async handleAssetEventList(eventList) {
    const toReturn = [];

    const pendingEvents = [];
    const filterSlugList = [];
    const filterTokenIdList = [];
    const filterListngTimeList = [];

    for (let i = 0; i < eventList.length; i++) {
      const event = eventList[i];
      const paymentTokenData = event.paymentToken;

      // Handle the payment token data for the asset event
      const priceCoefficient = 10 ** (-1 * Number(paymentTokenData.decimals));
      const startingPrice = parseFloat(event.startingPrice);
      const totalPrice = parseFloat(event.totalPrice);
      const tokenToEthPriceCoefficient = parseFloat(paymentTokenData.ethPrice);
      const tokenToUsdPriceCoefficient = parseFloat(paymentTokenData.usdPrice);

      let saveEvent = false;

      const areTokenCoefficientsValid =
        !Number.isNaN(tokenToEthPriceCoefficient) && !Number.isNaN(tokenToUsdPriceCoefficient);

      // Listing events
      if (event.eventType === 'created') {
        if (startingPrice && !Number.isNaN(startingPrice) && areTokenCoefficientsValid) {
          // Convert the price to Ethereum / USD using the payment token conversion coefficients
          event.price = {
            ethereum: startingPrice * priceCoefficient * tokenToEthPriceCoefficient,
            usd: startingPrice * priceCoefficient * tokenToUsdPriceCoefficient,
          };

          // Populate the listing expire time field based on the event timestamp and the duration
          const listingExpireTime = new Date(event.listingStartTime);
          listingExpireTime.setSeconds(listingExpireTime.getSeconds() + Number(event.duration));
          event.listingExpireTime = listingExpireTime;

          saveEvent = true;
        }
      } else if (event.eventType === 'successful') {
        if (totalPrice && !Number.isNaN(totalPrice) && areTokenCoefficientsValid) {
          // Convert the price to Ethereum / USD using the payment token conversion coefficients
          event.price = {
            ethereum: totalPrice * priceCoefficient * tokenToEthPriceCoefficient,
            usd: totalPrice * priceCoefficient * tokenToUsdPriceCoefficient,
          };
        }

        saveEvent = true;
      } else if (event.eventType === 'cancelled') {
        saveEvent = true;
      }

      if (saveEvent) {
        if (['successful', 'cancelled'].includes(event.eventType)) {
          pendingEvents.push(event);
          filterSlugList.push(event.collectionSlug);
          filterTokenIdList.push(event.tokenId);
          filterListngTimeList.push(event.listingTime);
        }

        toReturn.push(event);
      }
    }

    const listingEventsToUpdate = [];

    if (pendingEvents.length) {
      // Get the list of listing events associated with the new sale / cancellation events
      const dbListingEvents = await AssetEvent.find({
        eventType: 'created',
        collectionSlug: { $in: filterSlugList },
        tokenId: { $in: filterTokenIdList },
        listingStartTime: { $in: filterListngTimeList },
      })
        .select({
          _id: 1,
          id: 1,
          price: 1,
          collectionSlug: 1,
          tokenId: 1,
          listingStartTime: 1,
        })
        .lean();
      const newListingEvents = eventList.filter((ev) => ev.eventType === 'created');
      const allListingEvents = [...newListingEvents, ...dbListingEvents];

      for (let i = 0; i < pendingEvents.length; i++) {
        const pendingEvent = pendingEvents[i];

        const listingEvent = allListingEvents.find(
          (ev) =>
            ev.collectionSlug === pendingEvent.collectionSlug &&
            ev.tokenId === pendingEvent.tokenId &&
            new Date(ev.listingStartTime).getTime() === new Date(pendingEvent.listingTime).getTime()
        );

        // For the associated listing events populate the close reason and listing end time data
        if (listingEvent) {
          const updates = {
            listingEndTime: pendingEvent.eventTimestamp,
            listingCloseReason: pendingEvent.eventType === 'cancelled' ? 'cancelled' : 'sold',
            relatedSaleEventId: pendingEvent.id,
          };

          if (!pendingEvent.price && pendingEvent.eventType === 'successful') {
            pendingEvent.price = listingEvent.price;
          }

          Object.assign(listingEvent, updates);

          if (listingEvent._id) {
            listingEventsToUpdate.push(listingEvent);
          }
        }
      }
    }

    logger.debug(
      `NftService handleAssetEventList(): Found ${listingEventsToUpdate.length} related listing events to update`
    );

    if (listingEventsToUpdate.length) {
      await AssetEvent.bulkWrite(
        listingEventsToUpdate.map((eventToUpdate) => ({
          updateOne: {
            filter: { id: eventToUpdate.id },
            update: _.pick(eventToUpdate, ['listingEndTime', 'listingCloseReason', 'relatedSaleEventId']),
          },
        }))
      );
    }

    return toReturn;
  }

  // Handle outdated listings for slug
  async handleOutdatedListings(slug) {
    logger.trace(`NftService handleOutdatedListings(): Started`);

    try {
      let offset = 0;

      const maxListingEventBatchCount = 1000;

      const collection = await Collection.findOne({
        slug,
      })
        .select({
          lastCollectedEventDate: 1,
        })
        .lean();

      if (!collection) {
        return;
      }

      const lastListingHandledTime = collection.lastCollectedEventDate;

      const eventCount = await AssetEvent.count({
        eventType: 'created',
        listingEndTime: { $exists: false },
        collectionSlug: slug,
      });

      while (offset <= eventCount + maxListingEventBatchCount) {
        const eventsToUpdate = [];

        // Get the list of active listings from DB
        const activeListings = await AssetEvent.find({
          eventType: 'created',
          listingEndTime: { $exists: false },
          collectionSlug: slug,
        })
          .sort({ eventTimestamp: 1 })
          .limit(maxListingEventBatchCount)
          .select({
            id: 1,
            collectionSlug: 1,
            eventTimestamp: 1,
            tokenId: 1,
            listingStartTime: 1,
            listingExpireTime: 1,
          })
          .lean();

        offset += maxListingEventBatchCount;

        logger.debug(
          `NftService handleOutdatedListings(): Found ${activeListings.length} active listing events for ${slug}`
        );

        const saleTokenIds = [];
        let listingStartTime;
        let listingExpireTime;

        for (let i = 0; i < activeListings.length; i++) {
          const event = activeListings[i];

          saleTokenIds.push(event.tokenId);

          if (!listingStartTime) {
            listingStartTime = event.listingStartTime;
          } else if (event.listingStartTime.getTime() < listingStartTime.getTime()) {
            listingStartTime = event.listingStartTime;
          }

          if (!listingExpireTime) {
            listingExpireTime = event.listingExpireTime;
          } else if (event.listingExpireTime.getTime() > listingExpireTime.getTime()) {
            listingExpireTime = event.listingExpireTime;
          }
        }

        const saleEvents = await AssetEvent.find({
          eventType: 'successful',
          collectionSlug: slug,
          tokenId: { $in: saleTokenIds },
          eventTimestamp: { $gte: listingStartTime, $lte: listingExpireTime },
        })
          .select({
            eventTimestamp: 1,
            id: 1,
            tokenId: 1,
          })
          .lean();

        for (let i = 0; i < activeListings.length; i++) {
          const event = activeListings[i];

          // Check if the active listing event has the associated listing event
          const saleEvent = saleEvents.find(
            (ev) =>
              ev.tokenId === event.tokenId &&
              ev.eventTimestamp.getTime() > event.listingStartTime.getTime() &&
              ev.eventTimestamp.getTime() < event.listingExpireTime.getTime()
          );

          if (saleEvent) {
            Object.assign(event, {
              listingCloseReason: 'sold',
              listingEndTime: saleEvent.eventTimestamp,
              relatedSaleEventId: saleEvent.id,
            });

            logger.trace(
              `NftService handleOutdatedListings(): Listing event ${event.id} is associated with the sale event ${saleEvent.id}`
            );

            eventsToUpdate.push(event);
            // Check whether the listing event expired already
          } else if (event.listingExpireTime.getTime() < Date.now()) {
            Object.assign(event, {
              listingCloseReason: 'expired',
              listingEndTime: event.listingExpireTime,
            });

            logger.trace(`NftService handleOutdatedListings(): Listing event ${event.id} is expired`);

            eventsToUpdate.push(event);
          }
        }

        logger.trace(`NftService handleOutdatedListings(): Collected ${eventsToUpdate.length} events to update`);

        // Update the asset event in DB if it was expired or has an associated sale
        if (eventsToUpdate.length) {
          await AssetEvent.bulkWrite(
            eventsToUpdate.map((event) => ({
              updateOne: {
                filter: { id: event.id },
                update: _.pick(event, ['listingCloseReason', 'listingEndTime', 'relatedSaleEventId']),
              },
            }))
          );
        }
      }

      logger.trace(
        `NftService handleOutdatedListings(): Updating lastListingHandledTime for ${slug} to ${lastListingHandledTime}`
      );

      await Collection.update(
        { slug },
        {
          lastListingHandledTime,
        }
      );
    } catch (e) {
      console.error(e);
    }

    logger.trace('NftService handleOutdatedListings(): Finished execution');
  }

  // Refresh the trading history for the top volume collections
  async refreshTopCollectionTradingHistory() {
    logger.debug('NftService refreshTopCollectionTradingHistory(): Started');

    try {
      const allCollectionsToBeHandled = [];

      const topCollectionsByVolume = await Collection.find({
        disableHistoryCollection: { $ne: true },
        lastCollectedEventDate: { $exists: true },
        'stats.totalVolume': { $gt: MIN_COLLECTION_VOLUME_TARGET },
      })
        .sort({ 'stats.totalVolume': -1 })
        .select({
          slug: 1,
          lastTradingHistoryHandleTime: 1,
          lastCollectedEventDate: 1,
          lastListingHandledTime: 1,
        })
        .lean();

      allCollectionsToBeHandled.push(...topCollectionsByVolume);

      const uniqueCollections = _.uniqBy(allCollectionsToBeHandled, 'slug');

      logger.debug(`NftService refreshTopCollectionTradingHistory(): Handling ${uniqueCollections.length} slugs`);

      await this.handleTradingHistoryForCollectionList(uniqueCollections);
    } catch (e) {
      console.error(e);
    }

    logger.debug('NftService refreshTopCollectionTradingHistory(): Finished execution');
  }

  // Collect the orderbook historical data for all collections in the system
  async handleAllCollectionTradingHistory() {
    logger.debug(`NftService handleAllCollectionTradingHistory(): Started`);

    if (this.isTradingHistoryHandlingInProgress) {
      return;
    }

    try {
      this.isTradingHistoryHandlingInProgress = true;

      const collectionCount = await Collection.count({
        disableHistoryCollection: { $ne: true },
        lastCollectedEventDate: { $exists: true },
      });
      let collectionOffset = 0;

      while (collectionOffset < collectionCount + nftEventPageSize) {
        // Get the collection chunk from DB, sort by the
        const collections = await Collection.find({
          disableHistoryCollection: { $ne: true },
          lastCollectedEventDate: { $exists: true },
        })
          .sort({ 'stats.totalVolume': -1 })
          .skip(collectionOffset)
          .limit(nftEventPageSize)
          .select({
            slug: 1,
            lastTradingHistoryHandleTime: 1,
            lastCollectedEventDate: 1,
            lastListingHandledTime: 1,
          })
          .lean();
        const collectionSlugs = collections.map((c) => c.slug);
        logger.debug(`NftService handleAllCollectionTradingHistory(): Handling the slugs ${collectionSlugs}`);

        await this.handleTradingHistoryForCollectionList(collections);

        collectionOffset += nftEventPageSize;
      }
    } catch (e) {
      console.error(e);
    }

    this.isTradingHistoryHandlingInProgress = false;

    logger.debug('NftService handleAllCollectionTradingHistory(): Finished execution');
  }

  // Collect the orderbook historical data for the collection chunk
  async handleTradingHistoryForCollectionList(collectionList) {
    logger.trace('NftService handleTradingHistoryForCollectionList(): Started');

    try {
      const filteredCollections = collectionList.filter((c) => !curentTradingHistorySlugs[c.slug]);

      for (let i = 0; i < filteredCollections.length; i++) {
        curentTradingHistorySlugs[filteredCollections[i].slug] = true;
      }

      for (let i = 0; i < filteredCollections.length; i++) {
        const collection = filteredCollections[i];

        await this.handleSingleCollectionTradingHistory(collection).finally(() => {
          curentTradingHistorySlugs[collection.slug] = false;
        });
      }
    } catch (e) {
      console.error(e);
    }

    logger.trace('NftService handleTradingHistoryForCollectionList(): Finished execution');
  }

  // Helper function for getting the listing events that are active for the given timestamp
  filterListingEventList(event, startTs, endTs, minEthereumSalePrice) {
    const listingStartDateCriteria = endTs || startTs;

    if (!event.listingStartTime || event.listingStartTime.getTime() > listingStartDateCriteria.getTime()) {
      return false;
    }

    if (!event.listingExpireTime || event.listingExpireTime.getTime() < startTs.getTime()) {
      return false;
    }

    if (event.listingEndTime && event.listingEndTime.getTime() < startTs.getTime()) {
      return false;
    }

    if (minEthereumSalePrice) {
      if (!event.price || !event.price.ethereum || event.price.ethereum < 0.8 * minEthereumSalePrice) {
        return false;
      }
    }

    return true;
  }

  // Calculate the history data for the given timestamp (hour)
  async getTimestampHistoryData(slug, listingEvents, saleEvents, startTimestamp, endTimestamp, actualStartTimestamp) {
    logger.trace(
      `NftService getTimestampHistoryData(): Started collection for ${slug}, time range: ${startTimestamp} => ${endTimestamp}`
    );

    // Calculate the average sale price for the given hour
    // eslint-disable-next-line no-loop-func
    const timestampSaleEvents = saleEvents.filter((ev) => {
      return (
        ev &&
        ev.eventTimestamp &&
        ev.eventTimestamp.getTime() >= startTimestamp.getTime() &&
        ev.eventTimestamp.getTime() <= endTimestamp.getTime()
      );
    });

    const averageEthereumPrice = timestampSaleEvents.length ? _.meanBy(timestampSaleEvents, 'price.ethereum') : null;
    const averageUsdPrice = timestampSaleEvents.length ? _.meanBy(timestampSaleEvents, 'price.usd') : null;

    const averageSalePrice = _.isNumber(averageEthereumPrice)
      ? {
          ethereum: averageEthereumPrice,
          usd: averageUsdPrice,
        }
      : null;

    // Calculate the minimum sale price over the given time frame (12h before time frame and 12h after)
    const timestampExtendedSaleEvents = saleEvents.filter((ev) => {
      const timeShift = 12 * 60 * 60 * 1000;

      return (
        ev &&
        ev.eventTimestamp &&
        ev.eventTimestamp.getTime() >= startTimestamp.getTime() - timeShift &&
        ev.eventTimestamp.getTime() <= endTimestamp.getTime() + timeShift
      );
    });

    const minPriceSaleEvent = timestampExtendedSaleEvents.length
      ? _.minBy(timestampExtendedSaleEvents, 'price.ethereum')
      : null;
    const minEthereumSalePrice = minPriceSaleEvent ? minPriceSaleEvent.price.ethereum : null;

    const ethereumVolume = timestampSaleEvents.length ? _.sumBy(timestampSaleEvents, 'price.ethereum') : null;
    const usdVolume = timestampSaleEvents.length ? _.sumBy(timestampSaleEvents, 'price.usd') : null;
    const volume = _.isNumber(ethereumVolume)
      ? {
          ethereum: ethereumVolume,
          usd: usdVolume,
        }
      : null;

    const timestampStartListingEvents = listingEvents.filter((assetEvent) =>
      this.filterListingEventList(
        assetEvent,
        startTimestamp.getTime() < actualStartTimestamp.getTime() ? actualStartTimestamp : startTimestamp,
        null,
        minEthereumSalePrice
      )
    );

    // Calculate the trading data for the graph candles:
    // open floor price, chlose floor price, high floor price,
    // low floor price and volume
    const openFloorPriceItem = timestampStartListingEvents.length
      ? _.minBy(timestampStartListingEvents, 'price.ethereum')
      : null;
    const openFloorPrice = openFloorPriceItem ? openFloorPriceItem.price : null;

    const uniqueListingEvents = _.uniqBy(timestampStartListingEvents, 'tokenId');

    // eslint-disable-next-line no-loop-func
    const timestampEndListingEvents = listingEvents.filter((assetEvent) =>
      this.filterListingEventList(assetEvent, endTimestamp, null, minEthereumSalePrice)
    );
    const closeFloorPriceItem = timestampEndListingEvents.length
      ? _.minBy(timestampEndListingEvents, 'price.ethereum')
      : null;
    const closeFloorPrice = closeFloorPriceItem ? closeFloorPriceItem.price : null;

    // eslint-disable-next-line no-loop-func
    const timestampRangeListingEvents = listingEvents.filter((assetEvent) =>
      this.filterListingEventList(assetEvent, startTimestamp, endTimestamp, minEthereumSalePrice)
    );

    // Get the list of timestamps withing time range for checking the high and low floor prices
    let timestamps = [startTimestamp, endTimestamp];

    const listingDateFields = ['listingStartTime', 'listingExpireTime', 'listingEndTime'];

    // eslint-disable-next-line no-loop-func
    timestampRangeListingEvents.forEach((event) => {
      listingDateFields.forEach((field) => {
        if (
          event[field] &&
          event[field].getTime() <= endTimestamp.getTime() &&
          event[field].getTime() >= startTimestamp.getTime()
        ) {
          timestamps.push(event[field]);
        }
      });
    });

    timestamps = _.uniq(timestamps);

    const floorPriceEvents = [];

    timestamps.forEach((timestamp) => {
      // eslint-disable-next-line no-loop-func
      const eventList = timestampRangeListingEvents.filter((assetEvent) =>
        this.filterListingEventList(assetEvent, timestamp)
      );

      const floorPriceEvent = eventList.length ? _.minBy(eventList, 'price.ethereum') : null;

      if (floorPriceEvent) {
        floorPriceEvents.push(floorPriceEvent);
      }
    });

    // Calculate the high/low floor price values
    const lowFloorPriceEvent = floorPriceEvents.length ? _.minBy(floorPriceEvents, 'price.ethereum') : null;
    const lowFloorPrice = lowFloorPriceEvent ? lowFloorPriceEvent.price : null;

    const highFloorPriceEvent = floorPriceEvents.length ? _.maxBy(floorPriceEvents, 'price.ethereum') : null;
    const highFloorPrice = highFloorPriceEvent ? highFloorPriceEvent.price : null;

    return Promise.resolve({
      collectionSlug: slug,
      timestamp: startTimestamp,
      listedCount: uniqueListingEvents.length,
      openFloorPrice,
      closeFloorPrice,
      lowFloorPrice,
      highFloorPrice,
      averageSalePrice,
      volume,
    });
  }

  // Collect the orderbook historical data for the single collection
  async handleSingleCollectionTradingHistory(collection) {
    logger.trace(`NftService handleSingleCollectionTradingHistory(): Started for ${collection.slug}`);

    try {
      const { slug, lastTradingHistoryHandleTime, lastCollectedEventDate, lastListingHandledTime } = collection;

      logger.debug(
        `NftService handleSingleCollectionTradingHistory(): Handling the collection: slug ${slug}; lastTradingHistoryHandleTime: ${lastTradingHistoryHandleTime}; lastCollectedEventDate: ${lastCollectedEventDate}`
      );

      await this.handleOutdatedListings(slug);

      if (!lastCollectedEventDate || !lastListingHandledTime) {
        return;
      }

      const commonListingEventFilters = {
        collectionSlug: slug,
        eventType: 'created',
        listingStartTime: { $exists: true },
      };

      // Calculate the time range bounds in what the trading history will be handled and saved
      const earlierCollectionDate =
        lastListingHandledTime.getTime() < lastCollectedEventDate.getTime()
          ? lastListingHandledTime
          : lastCollectedEventDate;
      const timeRangeEnd = new Date(earlierCollectionDate);
      timeRangeEnd.setMinutes(0, 0, 0);
      let timeRangeStart;

      let actualTimeRangeStart;

      // By default we try to collect the statistics from the time of last successfull algorithm run for the given collection
      if (lastTradingHistoryHandleTime) {
        if (lastTradingHistoryHandleTime.getTime() >= timeRangeEnd.getTime()) {
          return;
        }

        actualTimeRangeStart = new Date(lastTradingHistoryHandleTime);
        timeRangeStart = new Date(lastTradingHistoryHandleTime);
        timeRangeStart.setMinutes(0, 0, 0);
      } else {
        // If algorithm has never been completed for the collection, we collect statistics from the first known listing event
        const firstListingEventList = await AssetEvent.find(commonListingEventFilters)
          .sort({ eventTimestamp: 1 })
          .limit(1)
          .select({
            listingStartTime: 1,
          })
          .lean();

        if (!firstListingEventList || !firstListingEventList.length) {
          logger.debug(`NftService handleSingleCollectionTradingHistory(): No listing events found for slug ${slug}`);

          return;
        }

        actualTimeRangeStart = new Date(firstListingEventList[0].listingStartTime);
        timeRangeStart = new Date(actualTimeRangeStart);
        timeRangeStart.setMinutes(0, 0, 0);
      }

      let chunkTimeRangeStart = new Date(timeRangeStart);
      // The default range for the collection is 10 days
      let chunkTimeRangeEnd = new Date(chunkTimeRangeStart);
      chunkTimeRangeEnd.setDate(chunkTimeRangeEnd.getDate() + 10);

      if (chunkTimeRangeEnd.getTime() > timeRangeEnd.getTime()) {
        chunkTimeRangeEnd = new Date(timeRangeEnd);
      }

      let calculateNextChunk = true;

      // The data is collected for each hour within the given time range
      while (calculateNextChunk) {
        // Retrieve the listing events
        const chunkListingEventFilters = {
          $and: [
            {
              ...commonListingEventFilters,
              listingStartTime: { $lte: chunkTimeRangeEnd },
              listingExpireTime: { $gte: chunkTimeRangeStart },
              $or: [
                {
                  listingEndTime: { $exists: false },
                },
                {
                  listingEndTime: { $gt: chunkTimeRangeStart },
                },
              ],
            },
          ],
        };

        // Get the listing events for the given time range
        const listingEvents = await AssetEvent.find(chunkListingEventFilters)
          .select({
            tokenId: 1,
            listingStartTime: 1,
            listingEndTime: 1,
            listingExpireTime: 1,
            price: 1,
            id: 1,
            eventTimestamp: 1,
          })
          .lean();

        logger.debug(
          `NftService handleSingleCollectionTradingHistory(): Collection: slug ${slug} - ${listingEvents.length} listing asset events found for chunk start time ${chunkTimeRangeStart} and end time ${chunkTimeRangeEnd}`
        );

        const newHistoryItems = [];
        const historyItemsToAdd = [];
        const historyItemsToUpdate = [];

        if (!listingEvents.length) {
          logger.debug(
            `NftService handleSingleCollectionTradingHistory(): Collection: slug ${slug} - no asset events found, deleting the incorrect listing history items for chunk start time ${chunkTimeRangeStart} and end time ${chunkTimeRangeEnd}`
          );

          // Delete the trading history records kf no listing events found for the given time range
          await CollectionTradingHistory.deleteMany({
            collectionSlug: slug,
            timestamp: { $gte: chunkTimeRangeStart, $lt: chunkTimeRangeEnd },
          });
        } else {
          let currentTimestamp = new Date(chunkTimeRangeStart);
          let nextTimestamp = new Date(currentTimestamp);
          nextTimestamp.setHours(nextTimestamp.getHours() + 1);

          logger.debug(
            `NftService handleSingleCollectionTradingHistory(): Collection: slug ${slug} - Start timestamp is: ${currentTimestamp}`
          );

          // Get the sale events for the given time range
          const saleEvents = await AssetEvent.find({
            collectionSlug: slug,
            eventType: 'successful',
            price: { $exists: true },
            eventTimestamp: { $gte: chunkTimeRangeStart, $lt: chunkTimeRangeEnd },
          })
            .select({
              tokenId: 1,
              eventTimestamp: 1,
              price: 1,
            })
            .lean();

          let calculateNextTimestamp = true;

          while (calculateNextTimestamp) {
            const historyItem = await this.getTimestampHistoryData(
              slug,
              listingEvents,
              saleEvents,
              currentTimestamp,
              nextTimestamp,
              actualTimeRangeStart
            );

            if (historyItem) {
              newHistoryItems.push(historyItem);
            }

            if (nextTimestamp.getTime() >= chunkTimeRangeEnd.getTime()) {
              calculateNextTimestamp = false;
            } else {
              currentTimestamp = new Date(currentTimestamp);
              currentTimestamp.setHours(currentTimestamp.getHours() + 1);

              nextTimestamp = new Date(currentTimestamp);
              nextTimestamp.setHours(nextTimestamp.getHours() + 1);

              if (nextTimestamp.getTime() > chunkTimeRangeEnd.getTime()) {
                nextTimestamp = new Date(chunkTimeRangeEnd);
              }
            }
          }
        }

        const existingHistoryItems = await CollectionTradingHistory.find({
          collectionSlug: slug,
          timestamp: { $gte: chunkTimeRangeStart, $lt: chunkTimeRangeEnd },
        }).lean();

        logger.debug(
          `NftService handleSingleCollectionTradingHistory(): Collection: slug ${slug}; Old history items found: ${existingHistoryItems.length} for chunk start time ${chunkTimeRangeStart} and end time ${chunkTimeRangeEnd}`
        );

        // Check whether the trading history for the given timestamp must be updated in DB or this is the new record
        newHistoryItems.forEach((item) => {
          const existingItem = existingHistoryItems.find(
            (existingHistoryItem) => existingHistoryItem.timestamp.getTime() === item.timestamp.getTime()
          );

          if (existingItem) {
            historyItemsToUpdate.push(item);
          } else {
            historyItemsToAdd.push(item);
          }
        });

        logger.debug(
          `NftService handleSingleCollectionTradingHistory(): Collection: slug ${slug}; Items to add: ${historyItemsToAdd.length}; Items to update: ${historyItemsToUpdate.length}`
        );

        // Save new trading history items in DB
        await CollectionTradingHistory.insertMany(historyItemsToAdd);

        // Update existing trading history items in DB
        if (historyItemsToUpdate.length) {
          await CollectionTradingHistory.bulkWrite(
            historyItemsToUpdate.map((historyItemToUpdate) => ({
              updateOne: {
                filter: { collectionSlug: slug, timestamp: historyItemToUpdate.timestamp },
                update: _.pick(historyItemToUpdate, [
                  'listedCount',
                  'openFloorPrice',
                  'closeFloorPrice',
                  'lowFloorPrice',
                  'highFloorPrice',
                  'averageSalePrice',
                  'volume',
                ]),
              },
            }))
          );
        }

        // Save the last trading history handle time in DB for the collection
        await Collection.updateOne(
          {
            slug,
          },
          { lastTradingHistoryHandleTime: chunkTimeRangeEnd }
        );

        if (chunkTimeRangeEnd.getTime() >= timeRangeEnd.getTime()) {
          calculateNextChunk = false;
        } else {
          chunkTimeRangeStart = new Date(chunkTimeRangeEnd);
          chunkTimeRangeEnd = new Date(chunkTimeRangeStart);
          chunkTimeRangeEnd.setDate(chunkTimeRangeEnd.getDate() + 10);

          if (chunkTimeRangeEnd.getTime() > timeRangeEnd.getTime()) {
            chunkTimeRangeEnd = new Date(timeRangeEnd);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    logger.trace('NftService handleSingleCollectionTradingHistory(): Finished execution');
  }
}

const nftService = new NftService();

module.exports = nftService;
