const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const collectionNoteSchema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      required: true,
    },
    text: {
      type: Schema.Types.String,
      required: true,
    },
    collectionSlug: {
      type: Schema.Types.String,
      required: true,
    },
    walletAddress: {
      type: Schema.Types.String,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

collectionNoteSchema.set('timestamps', true);
collectionNoteSchema.plugin(historyPlugin);
collectionNoteSchema.plugin(mongoosePaginate);

module.exports = collectionNoteSchema;
