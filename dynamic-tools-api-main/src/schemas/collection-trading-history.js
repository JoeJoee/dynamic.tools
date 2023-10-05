const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');
const priceSchema = require('./price');

const collectionTradingHistorySchema = new Schema(
  {
    collectionSlug: {
      type: Schema.Types.String,
    },
    timestamp: {
      type: Schema.Types.Date,
    },
    openFloorPrice: priceSchema,
    closeFloorPrice: priceSchema,
    lowFloorPrice: priceSchema,
    highFloorPrice: priceSchema,
    averageSalePrice: priceSchema,
    volume: priceSchema,
    listedCount: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

collectionTradingHistorySchema.index({ collectionSlug: 1, timestamp: 1 }, { unique: true });

collectionTradingHistorySchema.set('timestamps', true);
collectionTradingHistorySchema.plugin(historyPlugin);
collectionTradingHistorySchema.plugin(mongoosePaginate);

module.exports = collectionTradingHistorySchema;
