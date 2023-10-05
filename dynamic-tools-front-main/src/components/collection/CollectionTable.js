import React from 'react';
import CollectionTableBody from './CollectionTableBody';
import CollectionTableHeading from './CollectionTableHeading';

function CollectionTable() {
  return (
    <div className="collection-table-box">
      <CollectionTableHeading />
      <CollectionTableBody />
    </div>
  );
}

export default CollectionTable;
