const marketSummaryService = require('../../src/services/market-summary');
const { initialMarketSummary, updatedMarketSummary } = require('../default-data');

global.testStore = {};

describe('marketSummaryService TESTING :: ', () => {
  describe('#METHODS() :: ', () => {
    it('Basic methods', () => {
      expect(marketSummaryService.init).toBeDefined();
      expect(marketSummaryService.getMarketSummary).toBeDefined();
      expect(marketSummaryService.updateMarketSummary).toBeDefined();
    });

    it('getMarketSummary', () => {
      return marketSummaryService.getMarketSummary().then((data) => {
        expect(data).toBeDefined();
        expect(data.lastEthereumBlockNumber).toBe(initialMarketSummary.lastEthereumBlockNumber);
        expect(data.ethereumUsdPrice).toBe(initialMarketSummary.ethereumUsdPrice);
        expect(data.gasUsdPrice).toBe(initialMarketSummary.gasUsdPrice);
      });
    });

    it('updateMarketSummary', () => {
      return marketSummaryService
        .updateMarketSummary(updatedMarketSummary)
        .then(() => {
          return marketSummaryService.getMarketSummary();
        })
        .then((data) => {
          expect(data).toBeDefined();
          expect(data.lastEthereumBlockNumber).toBe(updatedMarketSummary.lastEthereumBlockNumber);
          expect(data.ethereumUsdPrice).toBe(updatedMarketSummary.ethereumUsdPrice);
          expect(data.gasUsdPrice).toBe(updatedMarketSummary.gasUsdPrice);
        });
    });
  });
});
