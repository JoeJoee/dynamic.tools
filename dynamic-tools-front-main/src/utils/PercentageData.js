import React from 'react';

function PercentageData(num) {
  if (!num || num === null || undefined) {
    // return <span className='text-green'>+0%</span>
    return <span>-</span>;
  }

  return num?.toString().includes('-') ? (
    <span className="text-red">{`${num?.toFixed(2)}%`}</span>
  ) : (
    <span className="text-green">{`+${num?.toFixed(2)}%`}</span>
  );
}

export default PercentageData;
