import React from 'react';
import { useNavigate } from 'react-router-dom';

function CollectionNotFound() {
  const navigate = useNavigate();

  return (
    <div className="collectionNotFound">
      <p>Collection Not Found</p>
      <p onClick={() => navigate('/')} className="backToHomeText">
        <i className="fa fa-arrow-left" />
        Back To Home
      </p>
    </div>
  );
}

export default CollectionNotFound;
