const fs = require('fs');
const _ = require('lodash');

const openseaService = require('../../src/services/opensea');
const { assetEvent, expectedFormattedAssetEvent } = require('../default-data');

global.testStore = {};

describe('openseaService TESTING :: ', () => {
  describe('#METHODS() :: ', () => {
    it('Basic methods', () => {
      expect(openseaService.getNftCollections).toBeDefined();
      expect(openseaService.getNftCollection).toBeDefined();
      expect(openseaService.convertCollectionToServerFormat).toBeDefined();
      expect(openseaService.getAssetEvents).toBeDefined();
      expect(openseaService.convertAssetEventToServerFormat).toBeDefined();
    });

    it('convertCollectionToServerFormat', () => {
      const formattedEvent = openseaService.convertAssetEventToServerFormat(assetEvent);
      expect(_.isEqual(formattedEvent, expectedFormattedAssetEvent)).toBe(true);
    });
  });
});
