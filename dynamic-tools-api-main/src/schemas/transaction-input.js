const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const tranactionInputSchema = new Schema(
  {
    method: {
      type: Schema.Types.String,
    },
    types: [
      {
        type: Schema.Types.String,
      },
    ],
    inputs: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    names: [
      {
        type: Schema.Types.Mixed,
      },
    ],
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

tranactionInputSchema.set('timestamps', true);
tranactionInputSchema.plugin(historyPlugin);
tranactionInputSchema.plugin(mongoosePaginate);

module.exports = tranactionInputSchema;
