import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="content">
      <div className="container">
        <div className="content-box">
          <div className="over-tab">
            <div className="collectionNotFound">
              <p>Page Not Found</p>
              <p onClick={() => navigate('/')} className="backToHomeText">
                <i className="fa fa-arrow-left" />
                Back To Home
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
