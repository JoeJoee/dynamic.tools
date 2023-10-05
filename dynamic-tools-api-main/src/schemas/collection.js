const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');
const assetContractSchema = require('./asset-contract');
const collectionStatsSchema = require('./collection-stats');
const paymentTokenSchema = require('./payment-token');

const collectionSchema = new Schema(
  {
    slug: {
      type: Schema.Types.String,
      unique: true,
    },
    payoutAddress: {
      type: Schema.Types.String,
    },
    name: {
      type: Schema.Types.String,
    },
    description: {
      type: Schema.Types.String,
    },
    shortDescription: {
      type: Schema.Types.String,
    },
    isTrending: {
      type: Schema.Types.Boolean,
    },
    featured: {
      type: Schema.Types.Boolean,
    },
    hidden: {
      type: Schema.Types.Boolean,
    },
    requireEmail: {
      type: Schema.Types.Boolean,
    },
    isSubjectToWhitelist: {
      type: Schema.Types.Boolean,
    },
    onlyProxiedTransfers: {
      type: Schema.Types.Boolean,
    },
    isNsfw: {
      type: Schema.Types.Boolean,
    },
    isRarityEnabled: {
      type: Schema.Types.Boolean,
    },
    safelistRequestStatus: {
      type: Schema.Types.String,
    },
    editors: [
      {
        type: Schema.Types.String,
      },
    ],
    primaryAssetContracts: [
      {
        type: assetContractSchema,
      },
    ],
    assetAddresses: [
      {
        type: Schema.Types.String,
      },
    ],
    paymentTokens: [
      {
        type: paymentTokenSchema,
      },
    ],
    stats: {
      type: collectionStatsSchema,
    },
    bannerImageUrl: {
      type: Schema.Types.String,
    },
    chatUrl: {
      type: Schema.Types.String,
    },
    discordUrl: {
      type: Schema.Types.String,
    },
    wikiUrl: {
      type: Schema.Types.String,
    },
    externalUrl: {
      type: Schema.Types.String,
    },
    telegramUrl: {
      type: Schema.Types.String,
    },
    featuredImageUrl: {
      type: Schema.Types.String,
    },
    imageUrl: {
      type: Schema.Types.String,
    },
    largeImageUrl: {
      type: Schema.Types.String,
    },
    twitterUsername: {
      type: Schema.Types.String,
    },
    instagramUsername: {
      type: Schema.Types.String,
    },
    defaultToFiat: {
      type: Schema.Types.Boolean,
    },
    devBuyerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    devSellerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    openseaBuyerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    openseaSellerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    mediumUsername: {
      type: Schema.Types.String,
    },
    fees: {
      sellerFees: {
        type: Object,
      },
      openseaFees: {
        type: Object,
      },
    },
    createdDate: {
      type: Schema.Types.Date,
    },
    pendingLastCollectedEventDate: {
      type: Schema.Types.Date,
    },
    pendingEventType: {
      type: Schema.Types.String,
    },
    lastCollectedEventDate: {
      type: Schema.Types.Date,
    },
    lastListingHandledTime: {
      type: Schema.Types.Date,
    },
    lastTradingHistoryHandleTime: {
      type: Schema.Types.Date,
    },
    lastStatsPopulatedTime: {
      type: Schema.Types.Date,
    },
    assetEventCursor: {
      type: Schema.Types.String,
    },
    disableHistoryCollection: {
      type: Schema.Types.Boolean,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

collectionSchema.set('timestamps', true);
collectionSchema.plugin(historyPlugin);
collectionSchema.plugin(mongoosePaginate);

module.exports = collectionSchema;
