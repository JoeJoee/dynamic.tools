import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { getCollections, setTimeRange, setCurrency } from '../../store/slices/collection';
import ethereumImage from '../../assets/images/ethereum-colored.svg';

function CollectionTableHeadRow({ timeRange, currency, setTimeRangeAction, setCurrencyAction, getCollectionsAction }) {
  const onCurrencyChange = useCallback(() => {
    setCurrencyAction(currency === 'USD' ? 'ETH' : 'USD');
    getCollectionsAction();
    setCurrencyAction(currency === 'USD' ? 'ETH' : 'USD');
  }, [currency, getCollectionsAction, setCurrencyAction]);

  const onTimeRangeValueChanged = useCallback(
    (item) => {
      if (item.disabled) {
        return;
      }

      setTimeRangeAction(item.value);
      getCollectionsAction();
    },
    [getCollectionsAction, setTimeRangeAction]
  );

  const timeRanges = [
    {
      value: '1m',
      disabled: true,
    },
    {
      value: '5m',
      disabled: true,
    },
    {
      value: '15m',
      disabled: true,
    },
    {
      value: '30m',
      disabled: true,
    },
    {
      value: '1h',
    },
    {
      value: '4h',
    },
    {
      value: '6h',
    },
    {
      value: '12h',
    },
    {
      value: '1d',
    },
    {
      value: '7d',
    },
    {
      value: '30d',
    },
  ];

  return (
    <div className="collection-table-header">
      <div className="collection-table-header-col time-range-column">
        <div className="trad-period">
          {timeRanges.map((item) => {
            const tooltipAttributes = item.disabled
              ? {
                  'data-toggle': 'tooltip',
                  'data-placement': 'top',
                  title: 'Coming Soon',
                }
              : {};

            return (
              <button
                type="button"
                key={item.value}
                onClick={() => onTimeRangeValueChanged(item)}
                className={clsx('time-range', {
                  active: timeRange === item.value,
                  disabled: item.disabled,
                })}
                {...tooltipAttributes}
              >
                {item.value}
              </button>
            );
          })}
        </div>
      </div>
      <div className="collection-table-header-col">
        <ul>
          <li>
            <span>
              <a href="#">
                <img src={ethereumImage} alt="Ethereum logo" />
              </a>
            </span>
            <div className="switch--box">
              <label className="cswitch">
                <span className="cswitch--label currency-image">$</span>
                <input
                  className="cswitch--input"
                  checked={currency === 'USD'}
                  type="checkbox"
                  onChange={onCurrencyChange}
                />
                <span className="cswitch--trigger wrapper" />
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    timeRange: state.collection.timeRange,
    currency: state.collection.currency,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setTimeRangeAction: (payload) => dispatch(setTimeRange(payload)),
  setCurrencyAction: (payload) => dispatch(setCurrency(payload)),
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTableHeadRow);
