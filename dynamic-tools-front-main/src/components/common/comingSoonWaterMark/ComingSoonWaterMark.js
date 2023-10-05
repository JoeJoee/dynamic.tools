import React from 'react';
import Watermark from 'react-awesome-watermark';
import styled from 'styled-components';

const StyledWatermark = styled(Watermark)`
  margin: 0 auto;
  position: absolute !important;

  .inner-watermark {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    font-size: 20px;
    text-align: center;
    line-height: 2;
  }
`;

function ComingSoonWaterMark({ children, width, height }) {
  return (
    <div>
      <StyledWatermark
        text="Coming Soon"
        style={{
          width,
          height,
          fontSize: 20,
          color: '#ffffff',
        }}
        multiple
      />
    </div>
  );
}

export default ComingSoonWaterMark;
