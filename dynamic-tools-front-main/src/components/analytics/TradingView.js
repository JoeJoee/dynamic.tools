import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { widget as Widget } from 'trading-view-library';

function TradingViewComponent({ data }) {
  const widgetOptions = useMemo(
    () => ({
      height: 500,
      symbol: data && data.slug ? data.slug : 'Unknown',
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(`${process.env.REACT_APP_BASE_URL}/trading-feed`),
      interval: '1H',
      container: 'collection-analytics-graph',
      library_path: '/charting_library/',
      locale: 'en',
      theme: 'Dark',
      enabled_features: [
        'use_localstorage_for_settings',
        'high_density_bars',
        'low_density_bars',
        'pricescale_currency',
      ],
      disabled_features: ['adaptive_logo', 'countdown'],
      studies_overrides: {},
      fullscreen: false,
      autosize: true,
      debug: 0,
      timezone: 'Etc/UTC',
      time_frames: [
        { text: '5y', resolution: '1H' },
        { text: '1y', resolution: '1H' },
        { text: '6m', resolution: '1H' },
        { text: '3m', resolution: '1H' },
        { text: '1m', resolution: '1H' },
        { text: '5d', resolution: '1H' },
        { text: '1d', resolution: '1H' },
      ],
      client_id: '0',
      user_id: '0',
      charts_storage_api_version: '1.1',
      favorites: { intervals: [], chartTypes: [] },
    }),
    [data]
  );

  useEffect(() => {
    const graphWidget = new Widget(widgetOptions);

    return () => {
      if (graphWidget !== null) {
        graphWidget.remove();
      }
    };
  }, [widgetOptions]);

  return <div id="collection-analytics-graph" />;
}

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(TradingViewComponent);
