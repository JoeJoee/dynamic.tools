const mongoose = require('mongoose');
const MongooseHistoryPlugin = require('mongoose-history-plugin');

const defaultSchemaOptions = {
  minimize: false,
  toJSON: {
    getters: true,
  },
};

const defaultHistoryOptions = {
  mongoose,
  userCollectionIdType: 'string',
};

const historyPlugin = MongooseHistoryPlugin(defaultHistoryOptions);

module.exports = {
  defaultSchemaOptions,
  defaultHistoryOptions,
  historyPlugin,
};
