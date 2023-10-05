const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const assetAddressSchema = new Schema(
  {
    id: {
      type: Schema.Types.Number,
    },
    user: {
      username: {
        type: Schema.Types.String,
      },
    },
    profileImgUrl: {
      type: Schema.Types.String,
    },
    address: {
      type: Schema.Types.String,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

assetAddressSchema.set('timestamps', true);
assetAddressSchema.plugin(historyPlugin);
assetAddressSchema.plugin(mongoosePaginate);

module.exports = assetAddressSchema;
