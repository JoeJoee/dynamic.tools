import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { connect } from 'react-redux';

function LoadingBackDrop({ loadingStatus }) {
  return (
    <div>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loadingStatus}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loadingStatus: state.collection.loadingStatus,
  };
};

export default connect(mapStateToProps)(LoadingBackDrop);
