import * as _ from 'lodash';

export const collectionColumns = [
  {
    field: 'sales',
    title: 'Sales',
    isTimeRangeSpecific: true,
    isMoneyField: false,
    isPriceField: false,
    sortable: true,
    showChange: true,
    defaultCurrency: 'USD',
  },
  {
    field: 'floorPrice',
    title: 'Sales Floor',
    isTimeRangeSpecific: true,
    isMoneyField: true,
    isPriceField: true,
    sortable: true,
    showChange: true,
    defaultCurrency: 'USD',
  },
  {
    field: 'averagePrice',
    title: 'Avg Sale Price',
    isTimeRangeSpecific: true,
    isMoneyField: true,
    isPriceField: true,
    sortable: true,
    showChange: true,
    defaultCurrency: 'USD',
  },
  {
    field: 'marketCap',
    title: 'Market Cap',
    isTimeRangeSpecific: false,
    isMoneyField: true,
    isPriceField: false,
    sortable: true,
    defaultCurrency: 'ETH',
    hideChange: true,
  },
  {
    field: 'volume',
    title: 'Volume',
    isTimeRangeSpecific: true,
    isMoneyField: true,
    isPriceField: false,
    sortable: true,
    showChange: true,
    defaultCurrency: 'USD',
  },
  {
    field: 'sevenDaysFloorPrices',
    graphField: 'floorPrice',
    title: '7D Sales Floor',
    isTimeRangeSpecific: false,
    isMoneyField: true,
    isGraphField: true,
    isPriceField: true,
    graphType: 'line',
    defaultCurrency: 'USD',
  },
  {
    field: 'sevenDaysVolumes',
    graphField: 'volume',
    title: '7D Volume',
    isTimeRangeSpecific: false,
    isMoneyField: true,
    isPriceField: false,
    isGraphField: true,
    graphType: 'bar',
    defaultCurrency: 'USD',
  },
];

export const getFieldPrefixByTimeRangeValue = (value) => {
  switch (value) {
    case '1m':
      return 'oneMinute';
    case '5m':
      return 'fiveMinute';
    case '15m':
      return 'fifteenMinute';
    case '30m':
      return 'thirtyMinute';
    case '1h':
      return 'oneHour';
    case '4h':
      return 'fourHour';
    case '6h':
      return 'sixHour';
    case '12h':
      return 'twelveHour';
    case '1d':
      return 'oneDay';
    case '7d':
      return 'sevenDay';
    case '30d':
      return 'thirtyDay';
    default:
      return '';
  }
};

export const getCollectionFieldSortKey = ({ field, isTimeRangeSpecific }, timeRange) => {
  return isTimeRangeSpecific ? `${getFieldPrefixByTimeRangeValue(timeRange)}${_.upperFirst(field)}` : field;
};
