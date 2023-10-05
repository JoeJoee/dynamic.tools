const cron = require('node-cron');
const ethereumService = require('./ethereum');
const nftService = require('./nft');
const priceService = require('./price');
const collectionService = require('./collection');

const tasks = {
  '* * * * *': async () => {
    // Populate the stats for top collections in the system
    try {
      collectionService.refreshTopCollectionListStats();
    } catch (err) {
      console.error('CronService: Failed to populate the collection stats');
    }
  },
  '*/3 * * * *': async () => {
    // Get the asset event data for top collections
    try {
      nftService.refreshTopCollectionAssetEventData();
    } catch (err) {
      console.error('CronService: Failed to refresh the asset event data for top collections');
    }

    // Refresh the trading history for top collections
    try {
      nftService.refreshTopCollectionTradingHistory();
    } catch (err) {
      console.error('CronService: Failed to refresh the trading history data for top collections');
    }
  },
  '*/5 * * * *': async () => {
    // Update market summary info
    try {
      ethereumService.updateBlockNumberInfo();
    } catch (err) {
      console.error('CronService: Failed to retrieve the last Ethereum block number');
    }

    // Get the latest Ethereum / Gas price
    try {
      priceService.refreshPriceData();
    } catch (err) {
      console.error('CronService: Failed to refresh the Ethereum / Gas price data');
    }
  },
  '*/10 * * * *': async () => {
    // Refresh the data for all NFT collection data
    try {
      nftService.refreshExistingCollectionData();
    } catch (err) {
      console.error('CronService: Failed to refresh the collection data');
    }

    // Collect the NFT transactions
    try {
      ethereumService.collectTransactionData();
    } catch (err) {
      console.error('CronService: Failed to collect the transaction data');
    }
  },
  '*/15 * * * *': async () => {
    /*
    // Refresh the trading history for all collections in the system
    try {
      nftService.handleAllCollectionTradingHistory();
    } catch (err) {
      console.error('CronService: Failed to refresh the trading history data for all collections');
    }

    // Get the asset event data for all collections in the system
    try {
      nftService.refreshAllAssetEventData();
    } catch (err) {
      console.error('CronService: Failed to refresh the asset event data');
    }

    // Populate the stats for all collections in the system
    try {
      collectionService.populateAllCollectionStats();
    } catch (err) {
      console.error('CronService: Failed to populate the collection stats for the collection list');
    }
    */
  },
  '0 * * * *': async () => {
    // Get the NFT collection data (Common process)
    try {
      nftService.refreshCollectionData();
    } catch (err) {
      console.error('CronService: Failed to refresh the collection data');
    }
  },
  '0 0 * * *': async () => {
    // Get the NFT collection data (for the address list)
    try {
      nftService.refreshCollectionForAddressList();
    } catch (err) {
      console.error('CronService: Failed to refresh the collection data for the address list');
    }
  },
};

function init() {
  Object.keys(tasks).forEach((time) => {
    const executors = Array.isArray(tasks[time]) ? tasks[time] : [tasks[time]];
    executors.forEach((executor) => cron.schedule(time, executor));
  });
}

module.exports = {
  init,
};
