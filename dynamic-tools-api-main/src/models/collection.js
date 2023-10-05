const mongoose = require('mongoose');
const collectionSchema = require('../schemas/collection');

const collection = mongoose.model('Collection', collectionSchema, 'nft-collection');

module.exports = collection;
