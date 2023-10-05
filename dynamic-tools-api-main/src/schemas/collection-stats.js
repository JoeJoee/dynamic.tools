const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { defaultSchemaOptions, historyPlugin } = require('./common');

const collectionStatsSchema = new Schema(
  {
    oneMinuteVolume: {
      type: Schema.Types.Number,
    },
    oneMinuteVolumeChange: {
      type: Schema.Types.Number,
    },
    oneMinuteFloorPrice: {
      type: Schema.Types.Number,
    },
    oneMinuteFloorPriceChange: {
      type: Schema.Types.Number,
    },
    oneMinuteSales: {
      type: Schema.Types.Number,
    },
    oneMinuteSalesChange: {
      type: Schema.Types.Number,
    },
    oneMinuteAveragePrice: {
      type: Schema.Types.Number,
    },
    oneMinuteAveragePriceChange: {
      type: Schema.Types.Number,
    },
    fiveMinuteVolume: {
      type: Schema.Types.Number,
    },
    fiveMinuteVolumeChange: {
      type: Schema.Types.Number,
    },
    fiveMinuteFloorPrice: {
      type: Schema.Types.Number,
    },
    fiveMinuteFloorPriceChange: {
      type: Schema.Types.Number,
    },
    fiveMinuteSales: {
      type: Schema.Types.Number,
    },
    fiveMinuteSalesChange: {
      type: Schema.Types.Number,
    },
    fiveMinuteAveragePrice: {
      type: Schema.Types.Number,
    },
    fiveMinuteAveragePriceChange: {
      type: Schema.Types.Number,
    },
    fifteenMinuteVolume: {
      type: Schema.Types.Number,
    },
    fifteenMinuteVolumeChange: {
      type: Schema.Types.Number,
    },
    fifteenMinuteFloorPrice: {
      type: Schema.Types.Number,
    },
    fifteenMinuteFloorPriceChange: {
      type: Schema.Types.Number,
    },
    fifteenMinuteSales: {
      type: Schema.Types.Number,
    },
    fifteenMinuteSalesChange: {
      type: Schema.Types.Number,
    },
    fifteenMinuteAveragePrice: {
      type: Schema.Types.Number,
    },
    fifteenMinuteAveragePriceChange: {
      type: Schema.Types.Number,
    },
    thirtyMinuteVolume: {
      type: Schema.Types.Number,
    },
    thirtyMinuteVolumeChange: {
      type: Schema.Types.Number,
    },
    thirtyMinuteFloorPrice: {
      type: Schema.Types.Number,
    },
    thirtyMinuteFloorPriceChange: {
      type: Schema.Types.Number,
    },
    thirtyMinuteSales: {
      type: Schema.Types.Number,
    },
    thirtyMinuteSalesChange: {
      type: Schema.Types.Number,
    },
    thirtyMinuteAveragePrice: {
      type: Schema.Types.Number,
    },
    thirtyMinuteAveragePriceChange: {
      type: Schema.Types.Number,
    },
    oneHourVolume: {
      type: Schema.Types.Number,
    },
    oneHourVolumeChange: {
      type: Schema.Types.Number,
    },
    oneHourFloorPrice: {
      type: Schema.Types.Number,
    },
    oneHourFloorPriceChange: {
      type: Schema.Types.Number,
    },
    oneHourChange: {
      type: Schema.Types.Number,
    },
    oneHourSales: {
      type: Schema.Types.Number,
    },
    oneHourSalesChange: {
      type: Schema.Types.Number,
    },
    oneHourAveragePrice: {
      type: Schema.Types.Number,
    },
    oneHourAveragePriceChange: {
      type: Schema.Types.Number,
    },
    oneHourDifference: {
      type: Schema.Types.Number,
    },
    fourHourVolume: {
      type: Schema.Types.Number,
    },
    fourHourVolumeChange: {
      type: Schema.Types.Number,
    },
    fourHourFloorPrice: {
      type: Schema.Types.Number,
    },
    fourHourFloorPriceChange: {
      type: Schema.Types.Number,
    },
    fourHourSales: {
      type: Schema.Types.Number,
    },
    fourHourSalesChange: {
      type: Schema.Types.Number,
    },
    fourHourAveragePrice: {
      type: Schema.Types.Number,
    },
    fourHourAveragePriceChange: {
      type: Schema.Types.Number,
    },
    sixHourVolume: {
      type: Schema.Types.Number,
    },
    sixHourVolumeChange: {
      type: Schema.Types.Number,
    },
    sixHourFloorPrice: {
      type: Schema.Types.Number,
    },
    sixHourFloorPriceChange: {
      type: Schema.Types.Number,
    },
    sixHourChange: {
      type: Schema.Types.Number,
    },
    sixHourSales: {
      type: Schema.Types.Number,
    },
    sixHourSalesChange: {
      type: Schema.Types.Number,
    },
    sixHourAveragePrice: {
      type: Schema.Types.Number,
    },
    sixHourAveragePriceChange: {
      type: Schema.Types.Number,
    },
    sixHourDifference: {
      type: Schema.Types.Number,
    },
    twelveHourVolume: {
      type: Schema.Types.Number,
    },
    twelveHourVolumeChange: {
      type: Schema.Types.Number,
    },
    twelveHourFloorPrice: {
      type: Schema.Types.Number,
    },
    twelveHourFloorPriceChange: {
      type: Schema.Types.Number,
    },
    twelveHourSales: {
      type: Schema.Types.Number,
    },
    twelveHourSalesChange: {
      type: Schema.Types.Number,
    },
    twelveHourAveragePrice: {
      type: Schema.Types.Number,
    },
    twelveHourAveragePriceChange: {
      type: Schema.Types.Number,
    },
    oneDayVolume: {
      type: Schema.Types.Number,
    },
    oneDayVolumeChange: {
      type: Schema.Types.Number,
    },
    oneDayFloorPrice: {
      type: Schema.Types.Number,
    },
    oneDayFloorPriceChange: {
      type: Schema.Types.Number,
    },
    oneDayChange: {
      type: Schema.Types.Number,
    },
    oneDaySales: {
      type: Schema.Types.Number,
    },
    oneDaySalesChange: {
      type: Schema.Types.Number,
    },
    oneDayAveragePrice: {
      type: Schema.Types.Number,
    },
    oneDayAveragePriceChange: {
      type: Schema.Types.Number,
    },
    oneDayDifference: {
      type: Schema.Types.Number,
    },
    sevenDayVolume: {
      type: Schema.Types.Number,
    },
    sevenDayVolumeChange: {
      type: Schema.Types.Number,
    },
    sevenDayFloorPrice: {
      type: Schema.Types.Number,
    },
    sevenDayFloorPriceChange: {
      type: Schema.Types.Number,
    },
    sevenDayChange: {
      type: Schema.Types.Number,
    },
    sevenDaySales: {
      type: Schema.Types.Number,
    },
    sevenDaySalesChange: {
      type: Schema.Types.Number,
    },
    sevenDayAveragePrice: {
      type: Schema.Types.Number,
    },
    sevenDayAveragePriceChange: {
      type: Schema.Types.Number,
    },
    sevenDayDifference: {
      type: Schema.Types.Number,
    },
    thirtyDayVolume: {
      type: Schema.Types.Number,
    },
    thirtyDayVolumeChange: {
      type: Schema.Types.Number,
    },
    thirtyDayFloorPrice: {
      type: Schema.Types.Number,
    },
    thirtyDayFloorPriceChange: {
      type: Schema.Types.Number,
    },
    thirtyDayChange: {
      type: Schema.Types.Number,
    },
    thirtyDaySales: {
      type: Schema.Types.Number,
    },
    thirtyDaySalesChange: {
      type: Schema.Types.Number,
    },
    thirtyDayAveragePrice: {
      type: Schema.Types.Number,
    },
    thirtyDayDifference: {
      type: Schema.Types.Number,
    },
    totalVolume: {
      type: Schema.Types.Number,
    },
    totalSales: {
      type: Schema.Types.Number,
    },
    totalSupply: {
      type: Schema.Types.Number,
    },
    count: {
      type: Schema.Types.Number,
    },
    listingCount: {
      type: Schema.Types.Number,
    },
    numOwners: {
      type: Schema.Types.Number,
    },
    averagePrice: {
      type: Schema.Types.Number,
    },
    numReports: {
      type: Schema.Types.Number,
    },
    marketCap: {
      type: Schema.Types.Number,
    },
    floorPrice: {
      type: Schema.Types.Number,
    },
    sevenDaysVolumes: [
      {
        type: Schema.Types.Number,
      },
    ],
    sevenDaysFloorPrices: [
      {
        type: Schema.Types.Number,
      },
    ],
  },
  {
    ...defaultSchemaOptions,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

collectionStatsSchema.set('timestamps', true);
collectionStatsSchema.plugin(historyPlugin);
collectionStatsSchema.plugin(mongoosePaginate);

module.exports = collectionStatsSchema;
