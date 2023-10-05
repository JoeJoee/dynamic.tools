const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const marketSummarySchema = new Schema(
  {
    lastEthereumBlockNumber: {
      type: Schema.Types.Number,
    },
    ethereumUsdPrice: {
      type: Schema.Types.Number,
    },
    gasUsdPrice: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

marketSummarySchema.set('timestamps', true);
marketSummarySchema.plugin(historyPlugin);
marketSummarySchema.plugin(mongoosePaginate);

module.exports = marketSummarySchema;
