const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const assetContractSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
    },
    description: {
      type: Schema.Types.String,
    },
    address: {
      type: Schema.Types.String,
    },
    payoutAddress: {
      type: Schema.Types.String,
    },
    owner: {
      type: Schema.Types.Number,
    },
    totalSupply: {
      type: Schema.Types.String,
    },
    assetContractType: {
      type: Schema.Types.String,
    },
    externalLink: {
      type: Schema.Types.String,
    },
    imageUrl: {
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
    buyerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    sellerFeeBasisPoints: {
      type: Schema.Types.Number,
    },
    onlyProxiedTransfers: {
      type: Schema.Types.Boolean,
    },
    nftVersion: {
      type: Schema.Types.String,
    },
    openseaVersion: {
      type: Schema.Types.String,
    },
    schemaName: {
      type: Schema.Types.String,
    },
    symbol: {
      type: Schema.Types.String,
    },
    createdDate: {
      type: Schema.Types.Date,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

assetContractSchema.set('timestamps', true);
assetContractSchema.plugin(historyPlugin);
assetContractSchema.plugin(mongoosePaginate);

module.exports = assetContractSchema;
