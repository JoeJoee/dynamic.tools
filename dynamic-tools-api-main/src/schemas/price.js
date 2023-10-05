const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const priceSchema = new Schema(
  {
    ethereum: {
      type: Schema.Types.Number,
    },
    usd: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

priceSchema.set('timestamps', true);
priceSchema.plugin(historyPlugin);
priceSchema.plugin(mongoosePaginate);

module.exports = priceSchema;
