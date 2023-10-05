const axios = require('axios');
const _ = require('lodash');
const rateLimit = require('./rate-limiter');

const { InvalidServerParameterError, MissingConfigurationParameter } = require('./errors');
const logger = require('./logger');

const { OPENSEA_API_URL, OPENSEA_API_KEYS, OPENSEA_MAX_REQUESTS_PER_SECOND } = process.env;
const openseaMaxRequestsPerSec = OPENSEA_MAX_REQUESTS_PER_SECOND ? Number(OPENSEA_MAX_REQUESTS_PER_SECOND) : 2;

const openseaApiKeys = (OPENSEA_API_KEYS || '').split(',');

class OpenseaService {
  constructor() {
    if (!OPENSEA_API_URL) {
      throw new MissingConfigurationParameter('OPENSEA_API_URL');
    }

    if (!openseaApiKeys.length) {
      throw new MissingConfigurationParameter('OPENSEA_API_KEYS');
    }

    this.mainAxiosInstance = axios.create({});

    this.securedAxiosInstance = rateLimit(axios.create({}), {
      maxRequests: openseaMaxRequestsPerSec,
      perMilliseconds: 1000,
    });

    this.nextApiKeyIndex = 0;
    this.apiKeyAmount = openseaApiKeys.length;
  }

  // Get the NFT collection data via Opensea REST API service
  getNftCollections(offset, limit, ownerAddress) {
    if (!_.isNumber(offset) || offset < 0) {
      throw new InvalidServerParameterError('getNftCollections(offset)');
    }

    if (!_.isNumber(limit) || limit < 1) {
      throw new InvalidServerParameterError('getNftCollections(limit)');
    }

    let url = `${OPENSEA_API_URL}/collections?offset=${offset}&limit=${limit}`;

    if (ownerAddress) {
      url += `&asset_owner=${ownerAddress}`;
    }

    return this.mainAxiosInstance
      .get(url)
      .then((res) => res.data)
      .then((data) => {
        if (!data) {
          return [];
        }

        let providerCollectionList = [];

        if (ownerAddress) {
          providerCollectionList = data.length ? data : [];
        } else {
          providerCollectionList = data.collections && data.collections.length ? data.collections : [];
        }

        return providerCollectionList.map(this.convertCollectionToServerFormat);
      });
  }

  // Get the single NFT collection data via Opensea REST API service
  getNftCollection(slug) {
    return this.mainAxiosInstance
      .get(`${OPENSEA_API_URL}/collection/${slug}`)
      .then((res) => res.data)
      .then((data) => {
        if (!data || !data.collection) {
          return null;
        }

        return this.convertCollectionToServerFormat(data.collection);
      });
  }

  // Convert the collection data retrieved from Opensea to the server format
  convertCollectionToServerFormat(collection) {
    if (!collection || !_.isObject(collection)) {
      return null;
    }

    const toReturn = {};

    // Convert the generic collection fields
    const generalCollectionData = _.omit(collection, ['primary_asset_contracts', 'payment_tokens', 'stats', 'fees']);

    for (const key in generalCollectionData) {
      toReturn[_.camelCase(key)] = generalCollectionData[key];
    }

    const primaryAssetContracts =
      collection && collection.primary_asset_contracts && collection.primary_asset_contracts.length
        ? collection.primary_asset_contracts
        : [];

    // Convert primary asset contracts
    toReturn.primaryAssetContracts = primaryAssetContracts.map((assetContract) => {
      const contractToReturn = {};

      for (const key in assetContract) {
        contractToReturn[_.camelCase(key)] = assetContract[key];
      }

      return contractToReturn;
    });

    toReturn.assetAddresses = primaryAssetContracts.map((contract) => _.toLower(contract.address));

    // Convert payment tokens
    const paymentTokens =
      collection && collection.payment_tokens && collection.payment_tokens.length ? collection.payment_tokens : [];

    toReturn.paymentTokens = paymentTokens.map((paymentToken) => {
      const tokenToReturn = {};

      for (const key in paymentToken) {
        tokenToReturn[_.camelCase(key)] = paymentToken[key];
      }

      return tokenToReturn;
    });

    // Convert stats
    const statData = collection && collection.stats ? collection.stats : {};
    const updatedStatData = {};

    for (const key in statData) {
      updatedStatData[_.camelCase(key)] = statData[key];
    }

    toReturn.stats = updatedStatData;

    // Convert fee data
    const collectionFeesData = collection && collection.fees ? collection.fees : {};
    toReturn.fees = {
      sellerFees: collectionFeesData.seller_fees,
      openseaFees: collectionFeesData.opensea_fees,
    };

    // The collection is considered as trending if the total sales stat value > 1
    toReturn.isTrending = toReturn.stats.totalSales > 1;

    return toReturn;
  }

  getAssetEvents(slug, eventType, limit, cursor, occurredAfter) {
    const apiKeyIndex =
      this.nextApiKeyIndex >= 0 && this.nextApiKeyIndex < this.apiKeyAmount ? this.nextApiKeyIndex : 0;
    const apiKey = openseaApiKeys[apiKeyIndex];

    this.nextApiKeyIndex = apiKeyIndex + 1;

    if (!apiKey) {
      throw new InvalidServerParameterError('apiKey');
    }

    let baseUrl = `${OPENSEA_API_URL}/events?&collection_slug=${slug}&event_type=${eventType}&limit=${limit}`;

    if (cursor) {
      baseUrl += `&cursor=${cursor}`;
    }

    if (occurredAfter) {
      baseUrl += `&occurred_after=${Math.floor(occurredAfter.getTime() / 1000)}`;
    }

    return this.securedAxiosInstance
      .get(baseUrl, {
        headers: {
          'X-API-KEY': apiKey,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        if (data && data.asset_events) {
          data.asset_events = data.asset_events.map(this.convertAssetEventToServerFormat);
        }

        return data;
      });
  }

  // Convert the asset event data retrieved from Opensea to the server format
  convertAssetEventToServerFormat(event) {
    if (!event || !_.isObject(event)) {
      return null;
    }

    const toReturn = {
      marketplace: 'opensea',
    };

    // Convert the generic event fields
    const generalEventData = _.pick(event, [
      'id',
      'event_type',
      'event_timestamp',
      'created_date',
      'starting_price',
      'duration',
      'contract_address',
      'collection_slug',
      'quantity',
      'total_price',
    ]);

    for (const key in generalEventData) {
      toReturn[_.camelCase(key)] = generalEventData[key];
    }

    if (event.event_type === 'created') {
      if (!event.duration) {
        return null;
      }

      toReturn.listingStartTime = event.listing_time || event.event_timestamp;
    } else if (event.event_type === 'successful' || event.event_type === 'cancelled') {
      toReturn.listingTime = event.listing_time;
    }

    if (event.event_type === 'successful') {
      const transaction = event && event.transaction;

      if (!transaction || !transaction.transaction_hash) {
        return null;
      }

      toReturn.transactionHash = transaction.transaction_hash;
    }

    if (!event.payment_token) {
      return null;
    }

    const complexFields = ['payment_token', 'seller', 'from_account'];

    for (let i = 0; i < complexFields.length; i++) {
      const fieldName = complexFields[i];
      const data = event[fieldName];

      if (data) {
        const newObj = {};

        for (const key in data) {
          newObj[_.camelCase(key)] = data[key];
        }

        toReturn[_.camelCase(fieldName)] = newObj;
      }
    }

    if (event.asset) {
      const newObj = {};

      const assetFields = [
        'id',
        'num_sales',
        'image_url',
        'image_preview_url',
        'image_thumbnail_url',
        'image_original_url',
        'name',
        'token_id',
        'owner',
        'permalink',
      ];

      for (let i = 0; i < assetFields.length; i++) {
        const key = assetFields[i];
        newObj[_.camelCase(key)] = event.asset[key];
      }

      if (event.asset.asset_contract) {
        Object.assign(newObj, {
          address: event.asset.asset_contract.address,
          assetContractType: event.asset.asset_contract.asset_contract_type,
          name: event.asset.asset_contract.name,
        });
      }

      newObj.tokenId = String(newObj.tokenId);
      toReturn.asset = newObj;

      if (event.asset.token_id) {
        toReturn.tokenId = String(event.asset.token_id);

        if (!toReturn.tokenId) {
          return null;
        }
      }
    }

    return toReturn;
  }
}

const openseaService = new OpenseaService();

module.exports = openseaService;
