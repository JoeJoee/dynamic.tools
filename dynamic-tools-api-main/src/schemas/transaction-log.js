const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const tranactionLogSchema = new Schema(
  {
    blockHash: {
      type: Schema.Types.String,
    },
    blockNumber: {
      type: Schema.Types.Number,
    },
    address: {
      type: Schema.Types.String,
    },
    data: {
      type: Schema.Types.String,
    },
    transactionHash: {
      type: Schema.Types.String,
    },
    transactionIndex: {
      type: Schema.Types.Number,
    },
    logIndex: {
      type: Schema.Types.Number,
    },
    removed: {
      type: Schema.Types.Boolean,
    },
    id: {
      type: Schema.Types.String,
    },
    topics: [
      {
        type: Schema.Types.String,
      },
    ],
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

tranactionLogSchema.set('timestamps', true);
tranactionLogSchema.plugin(historyPlugin);
tranactionLogSchema.plugin(mongoosePaginate);

module.exports = tranactionLogSchema;
