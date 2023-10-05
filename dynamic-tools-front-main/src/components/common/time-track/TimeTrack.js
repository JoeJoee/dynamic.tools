import React from 'react';
import ReactTooltip from 'react-tooltip';

function TimeTrack({ time, events }) {
  return (
    <span className="m-min active">
      {time}
      <div className="track-time">
        <ReactTooltip type="info" />
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          1m
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          5m
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          15m{' '}
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          30m
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          1h
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          4h
        </a>
        <a href="#" data-tip="Coming Soon" style={{ opacity: '0.5' }}>
          12h
        </a>
        <a onClick={() => events('1d')} href="#">
          1d
        </a>
        <a onClick={() => events('7d')} href="#">
          7d
        </a>
        <a onClick={() => events('30d')} href="#">
          30d
        </a>
      </div>
    </span>
  );
}

export default TimeTrack;
