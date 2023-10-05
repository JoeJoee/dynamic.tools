import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import clsx from 'clsx';
import { collectionColumns, getCollectionFieldSortKey } from '../../utils/Collection';
import defaultCollectionImage from '../../assets/images/dummyimage.png';
import ethereumImage from '../../assets/images/ethereum.svg';
import {
  addCollectionToWatchlist,
  deleteCollectionFromWatchlist,
  updateCollectionWatchlistStatus,
} from '../../store/slices/collection';
import { formatPrice } from '../../utils/formatPrice';
import CollectionTableChart from './CollectionTableChart';

function CollectionTableItem({
  collection,
  timeRange,
  mode,
  clickable,
  currency,
  walletAddress,
  updateCollectionWatchlistStatusAction,
  marketSummaryData,
}) {
  const navigate = useNavigate();

  const openCollection = (slug) => {
    if (clickable) {
      localStorage.setItem('slug', slug);
      navigate(`/collection/${slug}`);
    }
  };

  const { ethereumUsdPrice } = marketSummaryData;

  const { name: titleName } = collection;
  const stats = useMemo(() => (collection.stats ? collection.stats : {}), [collection.stats]);

  const logoImage = collection.imageUrl === null ? defaultCollectionImage : collection.imageUrl;

  const listingCount = useMemo(() => {
    return stats && stats.listingCount ? stats.listingCount : 0;
  }, [stats]);

  const currencyImage = useMemo(
    () =>
      currency === 'USD' ? (
        <span className="currency-image">$</span>
      ) : (
        <img src={ethereumImage} className="ethereum-logo" alt="Ethereum logo" />
      ),
    [currency]
  );

  const getPriceCoefficient = useCallback(
    ({ defaultCurrency, isMoneyField }) => {
      if (!ethereumUsdPrice) {
        return 1;
      }

      if (!isMoneyField || currency === defaultCurrency) {
        return 1;
      }

      return defaultCurrency === 'ETH' ? ethereumUsdPrice : 1 / ethereumUsdPrice;
    },
    [currency, ethereumUsdPrice]
  );

  const getStatColumnValue = useCallback(
    (column, useGraphField, isChangeValue) => {
      let { field } = column;
      const { graphField, isTimeRangeSpecific, isMoneyField } = column;

      field = useGraphField ? graphField : field;
      field = getCollectionFieldSortKey({ field, isTimeRangeSpecific }, timeRange);

      let value;

      if (isChangeValue) {
        value = stats[`${field}Change`];

        if (!_.isNumber(value)) {
          value = null;
        } else {
          value = value.toFixed(2);
        }
      } else {
        value = stats[field];

        if (!_.isNumber(value)) {
          value = null;
        } else {
          const coefficient = getPriceCoefficient(column);
          value *= coefficient;

          if (isMoneyField) {
            value = value.toFixed(4);
          }
        }
      }

      return value;
    },
    [getPriceCoefficient, stats, timeRange]
  );

  const toggleWatchlistStatus = useCallback(
    (e) => {
      e.stopPropagation();

      if (collection.addedToWatchlist) {
        deleteCollectionFromWatchlist({
          walletAddress,
          slug: collection.slug,
        }).then(() => {
          updateCollectionWatchlistStatusAction({
            slug: collection.slug,
            watchlistStatus: false,
          });
        });
      } else {
        addCollectionToWatchlist({
          walletAddress,
          slug: collection.slug,
        }).then(() => {
          updateCollectionWatchlistStatusAction({
            slug: collection.slug,
            watchlistStatus: true,
          });
        });
      }
    },
    [walletAddress, collection, updateCollectionWatchlistStatusAction]
  );

  const renderTableCell = useCallback(
    (stats, currency, statColumn) => {
      if (statColumn.isGraphField) {
        return (
          <CollectionTableChart
            items={stats[statColumn.field] || []}
            coefficient={getPriceCoefficient(statColumn)}
            currency={currency}
            type={statColumn.graphType}
          />
        );
      }

      const value = getStatColumnValue(statColumn);
      let valueString;

      if (Number.isNaN(value) || value === null) {
        valueString = statColumn.isPriceField ? '-' : 0;
      } else {
        valueString = statColumn.isMoneyField ? formatPrice(value) : value;
      }

      const changeValue = getStatColumnValue(statColumn, false, true);
      const changeValueString = changeValue === null ? '-' : `${changeValue}%`;

      return (
        <div className="collection-data-cell">
          <div>
            {statColumn.isMoneyField && !Number.isNaN(+value) && value !== null && value !== '' ? currencyImage : null}{' '}
            {valueString}
          </div>
          <div
            className={clsx({
              positive: changeValue > 0,
              negative: changeValue < 0,
            })}
          >
            {statColumn.hideChange ? '' : changeValueString}
          </div>
        </div>
      );
    },
    [currencyImage, getPriceCoefficient, getStatColumnValue]
  );

  return (
    <div className="collection-table-row">
      <div className="collection-table-col large">
        <div className="collection-details" onClick={() => openCollection(collection.slug)}>
          {walletAddress && mode !== 'watchlist' ? (
            <div
              className={clsx('watchlist-icon', { active: collection.addedToWatchlist })}
              onClick={toggleWatchlistStatus}
            >
              <i className="fa fa-star" />
            </div>
          ) : null}

          <span>
            <img src={logoImage} alt="Collection" />
          </span>
          <div className="collection-summary">
            {titleName}
            <span>Holders: {stats.numOwners}</span>
            <span>Supply: {stats.totalSupply}</span>
          </div>
        </div>
      </div>
      {collectionColumns.map((statColumn) => (
        <div key={statColumn.field} className="collection-table-col">
          {renderTableCell(stats, currency, statColumn)}
        </div>
      ))}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    timeRange: state.collection.timeRange,
    mode: state.collection.mode,
    currency: state.collection.currency,
    walletAddress: state.user.walletAddress,
    marketSummaryData: state.marketSummary.marketSummaryData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  updateCollectionWatchlistStatusAction: (payload) => dispatch(updateCollectionWatchlistStatus(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTableItem);
