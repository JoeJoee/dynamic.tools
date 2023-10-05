const mongoose = require('mongoose');
const applicationInfoSchema = require('../schemas/application-info');

const applicationInfo = mongoose.model('ApplicationInfo', applicationInfoSchema, 'application-info');

module.exports = applicationInfo;
