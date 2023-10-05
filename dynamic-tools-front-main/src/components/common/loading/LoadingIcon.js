import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function LoadingIcon() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <CircularProgress />
    </Box>
  );
}

export default LoadingIcon;
