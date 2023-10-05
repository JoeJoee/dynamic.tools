import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { getCollections, setMode } from '../../store/slices/collection';
import CollectionTableHeadRow from './CollectionTableHeadRow';
import CollectionTable from './CollectionTable';

const COLLECTION_CHUNK_SIZE = 10;

function CollectionList({ walletAddress, collectionData, timeRange, getCollectionsAction, setModeAction, mode }) {
  const [collectionAmount, setCollectionAmount] = useState(COLLECTION_CHUNK_SIZE);
  const isLoggedIn = localStorage.getItem('loggedInToMetaMask');

  const tabs = [
    {
      label: 'Trending',
      value: 'trending',
    },
    {
      label: 'Own',
      value: 'own',
      hide: !walletAddress,
    },
    {
      label: 'Watchlist',
      value: 'watchlist',
      hide: !walletAddress,
    },
  ];

  const loadMoreCollections = () => {
    getCollectionsAction({ offset: collectionAmount });
    setCollectionAmount(collectionAmount + COLLECTION_CHUNK_SIZE);
  };

  const onModeChange = (value) => {
    setModeAction(value);
    getCollectionsAction();
  };

  useEffect(() => {
    setCollectionAmount(COLLECTION_CHUNK_SIZE);
  }, [timeRange]);

  return (
    <div className="content-box">
      <div className="collection-page-header">
        {tabs.map((tabInfo) =>
          tabInfo.hide ? null : (
            <p
              key={tabInfo.value}
              onClick={() => onModeChange(tabInfo.value)}
              className={clsx('tab', { active: mode === tabInfo.value })}
            >
              {tabInfo.label}
            </p>
          )
        )}
      </div>
      <div className="tab-container">
        <CollectionTableHeadRow />
        <CollectionTable />
        {mode !== 'watchlist' && collectionData && collectionData.length && collectionAmount < 500 ? (
          <div className="text-center pt-5">
            <p onClick={loadMoreCollections} className="btn btn-load-more">
              Load More
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    mode: state.collection.mode,
    collectionData: state.collection.collectionData,
    walletAddress: state.user.walletAddress,
    searchValue: state.collection.searchValue,
    timeRange: state.collection.timeRange,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setModeAction: (payload) => dispatch(setMode(payload)),
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList);
