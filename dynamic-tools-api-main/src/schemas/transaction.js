const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');
const tranactionLogSchema = require('./transaction-log');
const tranactionInputSchema = require('./transaction-input');

const tranactionSchema = new Schema(
  {
    blockHash: {
      type: Schema.Types.String,
    },
    blockNumber: {
      type: Schema.Types.Number,
    },
    from: {
      type: Schema.Types.String,
    },
    gas: {
      type: Schema.Types.Number,
    },
    gasPrice: {
      type: Schema.Types.String,
    },
    maxFeePerGas: {
      type: Schema.Types.String,
    },
    maxPriorityFeePerGas: {
      type: Schema.Types.String,
    },
    hash: {
      type: Schema.Types.String,
    },
    rawInput: {
      type: Schema.Types.String,
    },
    input: {
      type: tranactionInputSchema,
    },
    nonce: {
      type: Schema.Types.Number,
    },
    to: {
      type: Schema.Types.String,
    },
    transactionIndex: {
      type: Schema.Types.Number,
    },
    value: {
      type: Schema.Types.String,
    },
    type: {
      type: Schema.Types.String,
    },
    accessList: [
      {
        type: Schema.Types.String,
      },
    ],
    chainId: {
      type: String,
    },
    contractAddress: {
      type: Schema.Types.String,
    },
    cumulativeGasUsed: {
      type: Schema.Types.Number,
    },
    effectiveGasPrice: {
      type: Schema.Types.Number,
    },
    gasUsed: {
      type: Schema.Types.Number,
    },
    logsBloom: {
      type: Schema.Types.String,
    },
    transactionHash: {
      type: Schema.Types.String,
      unique: true,
    },
    timestamp: {
      type: Schema.Types.Date,
    },
    logs: [
      {
        type: tranactionLogSchema,
      },
    ],
    transfers: [
      {
        assetAddress: {
          type: Schema.Types.String,
        },
        sellerAddress: {
          type: Schema.Types.String,
        },
        buyerAddress: {
          type: Schema.Types.String,
        },
        assetTokenId: {
          type: Schema.Types.Number,
        },
        price: {
          type: Schema.Types.Number,
        },
      },
    ],
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

tranactionSchema.index({ hash: 1 }, { unique: true });

tranactionSchema.set('timestamps', true);
tranactionSchema.plugin(historyPlugin);
tranactionSchema.plugin(mongoosePaginate);

module.exports = tranactionSchema;
