const axios = require('axios');
const _ = require('lodash');
const marketSummaryService = require('./market-summary');
const { PriceServiceApiError, MissingConfigurationParameter } = require('./errors');

const { PRICE_API_URL } = process.env;

class PriceService {
  constructor() {
    if (!PRICE_API_URL) {
      throw new MissingConfigurationParameter('PRICE_API_URL');
    }

    this.axios = axios.create({});
  }

  async refreshPriceData() {
    const currentGasPrice = await this.getPriceData('gas', 'usd');
    const currentEthereumPrice = await this.getPriceData('ethereum', 'usd');

    await marketSummaryService.updateMarketSummary({
      ethereumUsdPrice: currentEthereumPrice,
      gasUsdPrice: currentGasPrice,
    });
  }

  // Get the current price for the given resource name
  getPriceData(resourceName, currency = 'usd') {
    return this.axios
      .get(`${PRICE_API_URL}?ids=${resourceName}&vs_currencies=${currency}`)
      .then((res) => res.data)
      .then((data) => {
        const currentPrice =
          data && data[resourceName] && _.isNumber(data[resourceName][currency])
            ? Number(data[resourceName][currency])
            : null;

        if (!_.isNumber(currentPrice)) {
          throw new PriceServiceApiError(resourceName);
        }

        return currentPrice;
      });
  }
}

const priceService = new PriceService();

module.exports = priceService;
