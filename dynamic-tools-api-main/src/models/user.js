const mongoose = require('mongoose');
const userSchema = require('../schemas/user');

const userInfo = mongoose.model('User', userSchema, 'user');

module.exports = userInfo;
