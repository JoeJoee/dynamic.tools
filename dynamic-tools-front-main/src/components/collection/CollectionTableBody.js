import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getCollections, getCollectionWatchlist } from '../../store/slices/collection';
import LoadingIcon from '../common/loading/LoadingIcon';
import SomethingWentWrong from '../common/somethingWentWrong/SomethingWentWrong';
import CollectionTableItem from './CollectionTableItem';

function CollectionTableBody({
  collectionData,
  collectionWatchlist,
  collectionDataStatus,
  getCollectionsAction,
  getCollectionWatchlistAction,
  mode,
  walletAddress,
}) {
  useEffect(() => {
    if (mode !== 'watchlist') {
      getCollectionsAction();
    } else {
      getCollectionWatchlistAction({
        walletAddress,
        offset: 0,
        limit: 999,
      });
    }
  }, [mode, walletAddress, getCollectionWatchlistAction, getCollectionsAction]);

  const items = mode === 'watchlist' ? collectionWatchlist : collectionData;

  return (
    <div className="collection-table-body">
      {mode !== 'watchlist' && collectionDataStatus === 'loading' && <LoadingIcon />}
      {mode !== 'watchlist' && collectionDataStatus === 'failed' && <SomethingWentWrong />}
      {items.map((collection) => (
        <CollectionTableItem collection={collection} key={collection._id} clickable />
      ))}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    collectionData: state.collection.collectionData,
    collectionWatchlist: state.collection.collectionWatchlist,
    collectionDataStatus: state.collection.collectionDataStatus,
    mode: state.collection.mode,
    walletAddress: state.user.walletAddress,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
  getCollectionWatchlistAction: (payload) => dispatch(getCollectionWatchlist(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTableBody);
