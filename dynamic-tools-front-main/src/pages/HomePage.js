import React from 'react';
import { connect } from 'react-redux';
import CollectionList from '../components/collection/CollectionList';

function HomePageComponent() {
  return (
    <div className="content collection-list-page">
      <div className="container-fluid">
        <CollectionList />
      </div>
    </div>
  );
}

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(HomePageComponent);
