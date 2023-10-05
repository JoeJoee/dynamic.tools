const mongoose = require('mongoose');
const assetEventSchema = require('../schemas/asset-event');

const assetEvent = mongoose.model('AssetEvent', assetEventSchema, 'nft-asset-event');

module.exports = assetEvent;
