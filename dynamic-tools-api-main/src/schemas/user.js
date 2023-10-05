const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const userSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
    },
    avatarUrl: {
      type: Schema.Types.String,
    },
    email: {
      type: Schema.Types.String,
    },
    walletAddress: {
      type: Schema.Types.String,
      required: true,
    },
    nonce: {
      type: Schema.Types.Number,
      required: true,
    },
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

userSchema.set('timestamps', true);
userSchema.plugin(historyPlugin);
userSchema.plugin(mongoosePaginate);

module.exports = userSchema;
