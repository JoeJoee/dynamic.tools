const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const collectionWatchlistSchema = new Schema(
  {
    collectionData: { type: Schema.Types.ObjectId, ref: 'Collection' },
    walletAddress: {
      type: Schema.Types.String,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

collectionWatchlistSchema.index({ collectionData: 1, walletAddress: 1 }, { unique: true });

collectionWatchlistSchema.set('timestamps', true);
collectionWatchlistSchema.plugin(historyPlugin);
collectionWatchlistSchema.plugin(mongoosePaginate);

module.exports = collectionWatchlistSchema;
