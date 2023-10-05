const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const applicationInfoSchema = new Schema(
  {
    lastHandledEthereumBlock: {
      type: Schema.Types.Number,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

applicationInfoSchema.set('timestamps', true);
applicationInfoSchema.plugin(historyPlugin);
applicationInfoSchema.plugin(mongoosePaginate);

module.exports = applicationInfoSchema;
