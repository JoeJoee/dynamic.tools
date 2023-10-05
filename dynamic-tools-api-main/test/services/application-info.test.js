const applicationInfoService = require('../../src/services/application-info');
const { initialApplicationInfo, updatedApplicationInfo } = require('../default-data');

global.testStore = {};

describe('applicationInfoService TESTING :: ', () => {
  describe('#METHODS() :: ', () => {
    it('Basic methods', () => {
      expect(applicationInfoService.init).toBeDefined();
      expect(applicationInfoService.getApplicationInfo).toBeDefined();
      expect(applicationInfoService.updateApplicationInfo).toBeDefined();
    });

    it('getApplicationInfo', () => {
      return applicationInfoService.getApplicationInfo().then((data) => {
        expect(data).toBeDefined();
        expect(data.lastEthereumBlockNumber).toBe(initialApplicationInfo.lastEthereumBlockNumber);
        expect(data.ethereumUsdPrice).toBe(initialApplicationInfo.ethereumUsdPrice);
        expect(data.gasUsdPrice).toBe(initialApplicationInfo.gasUsdPrice);
      });
    });

    it('updateApplicationInfo', () => {
      return applicationInfoService
        .updateApplicationInfo(updatedApplicationInfo)
        .then(() => {
          return applicationInfoService.getApplicationInfo();
        })
        .then((data) => {
          expect(data).toBeDefined();
          expect(data.lastEthereumBlockNumber).toBe(updatedApplicationInfo.lastEthereumBlockNumber);
          expect(data.ethereumUsdPrice).toBe(updatedApplicationInfo.ethereumUsdPrice);
          expect(data.gasUsdPrice).toBe(updatedApplicationInfo.gasUsdPrice);
        });
    });
  });
});
