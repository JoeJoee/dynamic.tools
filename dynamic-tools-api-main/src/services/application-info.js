const ApplicationInfo = require('../models/application-info');

const { NFT_INITIAL_BLOCK_NUMBER = 0 } = process.env;

class ApplicationInfoService {
  async init() {
    // Create the application info DB record if it does not exist yet
    let record = await ApplicationInfo.findOne();

    if (!record) {
      record = await ApplicationInfo.create({});
    }

    const lastHandledEthereumBlock = record.lastHandledEthereumBlock || 0;

    if (lastHandledEthereumBlock < NFT_INITIAL_BLOCK_NUMBER) {
      await ApplicationInfo.updateMany({}, { lastHandledEthereumBlock: NFT_INITIAL_BLOCK_NUMBER });
    }
  }

  // Get the application info record
  async getApplicationInfo() {
    const records = await ApplicationInfo.find({});

    if (records && records.length) {
      return records[0];
    }

    return ApplicationInfo.create({});
  }

  // Update the application info record
  async updateApplicationInfo(data = {}) {
    let record = await ApplicationInfo.findOne({});

    if (!record) {
      await ApplicationInfo.create({});
      record = await ApplicationInfo.findOne({});
    }

    await ApplicationInfo.updateMany({}, data);
  }
}

const applicationInfoService = new ApplicationInfoService();

module.exports = applicationInfoService;
