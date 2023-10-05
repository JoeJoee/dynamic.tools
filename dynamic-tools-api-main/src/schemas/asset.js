const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const assetSchema = new Schema(
  {
    id: {
      type: Schema.Types.Number,
    },
    address: {
      type: Schema.Types.String,
    },
    assetContractType: {
      type: Schema.Types.String,
    },
    name: {
      type: Schema.Types.String,
    },
    schemaName: {
      type: Schema.Types.String,
    },
    owner: {
      type: Schema.Types.Number,
    },
    numSales: {
      type: Schema.Types.Number,
    },
    imageUrl: {
      type: Schema.Types.String,
    },
    imagePreviewUrl: {
      type: Schema.Types.String,
    },
    imageThumbnailUrl: {
      type: Schema.Types.String,
    },
    imageOriginalUrl: {
      type: Schema.Types.String,
    },
    permalink: {
      type: Schema.Types.String,
    },
    tokenId: {
      type: Schema.Types.String,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

assetSchema.set('timestamps', true);
assetSchema.plugin(historyPlugin);
assetSchema.plugin(mongoosePaginate);

module.exports = assetSchema;
