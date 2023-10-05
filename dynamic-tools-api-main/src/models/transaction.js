const mongoose = require('mongoose');
const transactionSchema = require('../schemas/transaction');

const transaction = mongoose.model('Transaction', transactionSchema, 'nft-transaction');

module.exports = transaction;
