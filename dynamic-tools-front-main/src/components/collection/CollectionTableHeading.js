import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { getCollections, setSortKey } from '../../store/slices/collection';
import { collectionColumns } from '../../utils/Collection';

function CollectionTableHeading({ sortDirection, sortKey, setSortKeyAction, getCollectionsAction }) {
  const onSortParamChange = (newSortKey) => {
    setSortKeyAction(newSortKey);
    getCollectionsAction();
  };

  return (
    <div className="collection-table-column-description">
      <div className="collection-table-col large">
        <span className="collection-title">Collection</span>
      </div>
      {collectionColumns.map((item) => (
        <div
          key={item.field}
          className="collection-table-col"
          onClick={() => onSortParamChange(item.sortable ? item.field : '')}
        >
          <button type="button" className="dropdown-toggle">
            {item.title}
          </button>

          {item.sortable && sortKey === item.field ? (
            <p>
              <span>
                <i
                  className={clsx('fal', {
                    'fa-sort-up': sortDirection === 'asc',
                    'fa-sort-down': sortDirection === 'desc',
                  })}
                />
              </span>
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    sortKey: state.collection.sortKey,
    sortDirection: state.collection.sortDirection,
    timeRange: state.collection.timeRange,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setSortKeyAction: (payload) => dispatch(setSortKey(payload)),
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTableHeading);
