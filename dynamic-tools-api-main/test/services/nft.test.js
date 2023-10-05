const nftService = require('../../src/services/nft');

global.testStore = {};

describe('nftService TESTING :: ', () => {
  describe('#METHODS() :: ', () => {
    it('Basic methods', () => {
      expect(nftService.init).toBeDefined();
      expect(nftService.startCollectionRefreshProcess).toBeDefined();
      expect(nftService.refreshCollectionForAddressList).toBeDefined();
      expect(nftService.refreshAssetEventData).toBeDefined();
      expect(nftService.refreshAssetEventDataForCollectionList).toBeDefined();
      expect(nftService.handleAssetEventList).toBeDefined();
      expect(nftService.getAssetEventsForSlug).toBeDefined();
      expect(nftService.handleOutdatedListings).toBeDefined();
      expect(nftService.handleCollectionTradingHistory).toBeDefined();
      expect(nftService.handleTradingHistoryForCollectionList).toBeDefined();
      expect(nftService.handleSingleCollectionTradingHistory).toBeDefined();
    });
  });
});
