import React from 'react';
import { connect } from 'react-redux';
import defaultCollectionImage from '../../assets/images/dummyimage.png';
import { formatPrice } from '../../utils/formatPrice';
import ethereumImage from '../../assets/images/ethereum.svg';

function CollectionStatisticsView({ data, marketSummaryData }) {
  const logoImage = !data || data.imageUrl === null ? defaultCollectionImage : data.imageUrl;
  const stats = data && data.stats ? data.stats : {};

  const listings = stats && stats.listingCount ? stats.listingCount : 0;
  const numOwners = stats && stats.numOwners ? stats.numOwners : 0;

  const ethereumUsdPrice =
    marketSummaryData && marketSummaryData.ethereumUsdPrice ? marketSummaryData.ethereumUsdPrice : null;

  return (
    <div className="collection-details-view">
      {data ? (
        <>
          <img src={logoImage} className="collection-logo" alt="Collection logo" />
          <div className="collection-data-field">
            <div className="value">{data.name}</div>
            <div className="field-name">{data.slug}</div>
          </div>
          <div className="collection-data-field">
            <div className="value">
              <img src={ethereumImage} className="ethereum-logo" alt="Ethereum logo" />
              {formatPrice(stats.marketCap)}
            </div>
            <div className="field-name">Market Cap</div>
          </div>
          {ethereumUsdPrice ? (
            <>
              <div className="collection-data-field">
                <div className="value">
                  <img src={ethereumImage} className="ethereum-logo" alt="Ethereum logo" />
                  {formatPrice(stats.totalVolume / ethereumUsdPrice)}
                </div>
                <div className="field-name">Volume</div>
              </div>
              <div className="collection-data-field">
                <div className="value">
                  <img src={ethereumImage} className="ethereum-logo" alt="Ethereum logo" />
                  {formatPrice(stats.floorPrice / ethereumUsdPrice)}
                </div>
                <div className="field-name">Sales Floor</div>
              </div>
            </>
          ) : null}

          <div className="collection-data-field">
            <div className="value">{stats.totalSales || 0}</div>
            <div className="field-name">Sales</div>
          </div>
          <div className="collection-data-field">
            <div className="value">{Math.ceil((numOwners / stats.totalSupply) * 100)}%</div>
            <div className="field-name">Holders</div>
          </div>
          <div className="collection-data-field">
            <div className="value">{stats.totalSupply}</div>
            <div className="field-name">Supply</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    marketSummaryData: state.marketSummary.marketSummaryData,
  };
};

export default connect(mapStateToProps)(CollectionStatisticsView);
