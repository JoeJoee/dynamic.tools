import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment';
import clsx from 'clsx';
import openseaLogo from '../../assets/images/opensea.svg';
import { getCollectionListings, getCollectionSales } from '../../store/slices/collection';
import { formatPrice } from '../../utils/formatPrice';
import ethereumImage from '../../assets/images/ethereum.svg';

const openSeaTokenPageUrl = 'https://opensea.io/assets/ethereum';
const pageSize = 100;

function CollectionResistanceView({ getCollectionListingsAction, getCollectionSalesAction, listings, sales, slug }) {
  const [activeTab, setActiveTab] = useState('listings');
  const [listingListOffset, setListingListOffset] = useState(0);
  const [saleListOffset, setSaleListOffset] = useState(0);

  useEffect(() => {
    getCollectionListingsAction({
      slug,
      offset: listingListOffset,
      limit: pageSize,
    });
  }, [getCollectionListingsAction, slug, listingListOffset]);

  useEffect(() => {
    getCollectionSalesAction({
      slug,
      offset: saleListOffset,
      limit: pageSize,
    });
  }, [getCollectionSalesAction, slug, saleListOffset]);

  const renderOpenSeaLink = useCallback((event) => {
    if (!event || !event.asset || !event.asset.address || !event.tokenId) {
      return null;
    }

    return (
      <button
        type="button"
        className="event-token-button"
        onClick={() => {
          window.open(`${openSeaTokenPageUrl}/${event.asset.address}/${event.tokenId}`, '_blank').focus();
        }}
      >
        <img className="event-token-button-icon" src={openseaLogo} alt="OpenSea icon" />
      </button>
    );
  }, []);

  const tabs = [
    {
      label: 'Listings',
      value: 'listings',
    },
    {
      label: 'Sales',
      value: 'sales',
    },
  ];

  const items = activeTab === 'listings' ? listings : sales;

  return (
    <div className="resistance-wrapper">
      <div className="resistance-tab-list">
        {tabs.map((tabInfo) => (
          <div
            key={tabInfo.value}
            className={clsx('resistance-tab', {
              active: activeTab === tabInfo.value,
            })}
            onClick={() => setActiveTab(tabInfo.value)}
          >
            {tabInfo.label}
          </div>
        ))}
      </div>
      {!items ? <div className="order-empty-list">Data is not loaded yet</div> : null}
      {items && !items.length ? <div className="order-empty-list">No items found</div> : null}
      {items && items.length ? (
        <div className="order-table">
          <div className="order-table-header">
            <div className="order-table-header-cell">Date</div>
            <div className="order-table-header-cell token">TokenId</div>
            <div className="order-table-header-cell">Price (ETH)</div>
          </div>
          <div className="order-table-content">
            {items.map((item) => {
              const { tokenId = '' } = item;

              const tokenIdStr = tokenId.length > 5 ? `${tokenId.slice(0, 5)}...` : tokenId;

              return (
                <div key={item.id} className="order-table-item">
                  <div className="order-table-content-cell timestamp">
                    <div>{moment(item.eventTimestamp).format('YYYY-MM-DD')}</div>
                    <div>{moment(item.eventTimestamp).format('HH:mm')}</div>
                  </div>
                  <div className="order-table-content-cell token" title={tokenId}>
                    {tokenIdStr}
                  </div>
                  <div className="order-table-content-cell price">
                    <img src={ethereumImage} className="ethereum-logo" alt="Ethereum logo" />
                    {formatPrice(item.price.ethereum)}
                    {renderOpenSeaLink(item)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    listings: state.collection.collectionListings,
    sales: state.collection.collectionSales,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCollectionListingsAction: (payload) => dispatch(getCollectionListings(payload)),
  getCollectionSalesAction: (payload) => dispatch(getCollectionSales(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionResistanceView);
