const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const paymentTokenSchema = new Schema(
  {
    id: {
      type: Schema.Types.Number,
    },
    symbol: {
      type: Schema.Types.String,
    },
    address: {
      type: Schema.Types.String,
    },
    imageUrl: {
      type: Schema.Types.String,
    },
    name: {
      type: Schema.Types.String,
    },
    decimals: {
      type: Schema.Types.Number,
    },
    ethPrice: {
      type: Schema.Types.Number,
    },
    usdPrice: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

paymentTokenSchema.set('timestamps', true);
paymentTokenSchema.plugin(historyPlugin);
paymentTokenSchema.plugin(mongoosePaginate);

module.exports = paymentTokenSchema;
