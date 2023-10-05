import React from 'react';
import { Helmet } from 'react-helmet';

function NewMarketOverViewChart() {
  // methods for trendingview map
  const useScript = (url) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  };

  return (
    <>
      {useScript('https://s3.tradingview.com/tv.js')}
      <div id="tradingview_2d7e4" />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/symbols/BTCUSDT/" rel="noopener noreferrer" target="_blank" />
      </div>
      <Helmet>
        <script type="text/javascript">
          {`
            new window.TradingView.widget({
                "width": 1400,
                "height": 800,
                "symbol": \`BTCUSDT\`,
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#f1f3f6",
                "enable_publishing": false,
                "withdateranges": true,
                "hide_side_toolbar": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_2d7e4"
            })
        `}
        </script>
      </Helmet>
    </>
  );
}

export default NewMarketOverViewChart;
