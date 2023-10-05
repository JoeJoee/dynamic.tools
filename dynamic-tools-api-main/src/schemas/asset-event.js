const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');
const assetSchema = require('./asset');
const assetAddressSchema = require('./asset-address');
const paymentTokenSchema = require('./payment-token');
const priceSchema = require('./price');

const assetEventSchema = new Schema(
  {
    id: {
      type: Schema.Types.Number,
      unique: true,
    },
    asset: {
      type: assetSchema,
    },
    eventType: {
      type: Schema.Types.String,
    },
    eventTimestamp: {
      type: Schema.Types.Date,
    },
    listingTime: {
      type: Schema.Types.Date,
    },
    listingStartTime: {
      type: Schema.Types.Date,
    },
    listingEndTime: {
      type: Schema.Types.Date,
    },
    listingExpireTime: {
      type: Schema.Types.Date,
    },
    listingCloseReason: {
      type: Schema.Types.String,
    },
    createdDate: {
      type: Schema.Types.Date,
    },
    price: priceSchema,
    paymentToken: {
      type: paymentTokenSchema,
    },
    transactionHash: {
      type: String,
    },
    seller: {
      type: assetAddressSchema,
    },
    fromAccount: {
      type: assetAddressSchema,
    },
    duration: {
      type: Schema.Types.Number,
    },
    collectionSlug: {
      type: Schema.Types.String,
    },
    quantity: {
      type: Schema.Types.Number,
    },
    tokenId: {
      type: Schema.Types.String,
    },
    marketplace: {
      type: Schema.Types.String,
    },
    relatedSaleEventId: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

assetEventSchema.set('timestamps', true);
assetEventSchema.plugin(historyPlugin);
assetEventSchema.plugin(mongoosePaginate);

module.exports = assetEventSchema;
