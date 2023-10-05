// import React from "react";
// import { Line } from "react-chartjs-2";
// import zoomPlugin from 'chartjs-plugin-zoom';

// import {
//   Chart,
//   ArcElement,
//   LineElement,
//   BarElement,
//   PointElement,
//   BarController,
//   BubbleController,
//   DoughnutController,
//   LineController,
//   PieController,
//   PolarAreaController,
//   RadarController,
//   ScatterController,
//   CategoryScale,
//   LinearScale,
//   LogarithmicScale,
//   RadialLinearScale,
//   TimeScale,
//   TimeSeriesScale,
//   Decimation,
//   Filler,
//   Legend,
//   Title,
//   Tooltip,
//   SubTitle,
// } from "chart.js";

// Chart.register(zoomPlugin);

// Chart.register(
//   ArcElement,
//   LineElement,
//   BarElement,
//   PointElement,
//   BarController,
//   BubbleController,
//   DoughnutController,
//   LineController,
//   PieController,
//   PolarAreaController,
//   RadarController,
//   ScatterController,
//   CategoryScale,
//   LinearScale,
//   LogarithmicScale,
//   RadialLinearScale,
//   TimeScale,
//   TimeSeriesScale,
//   Decimation,
//   Filler,
//   Legend,
//   Title,
//   Tooltip,
//   SubTitle
// );

// const MarketOverViewChart = () => {
//   const options = {
//     responsive: true,
//     scales: {
//       x: {
//         grid:{
//           lineWidth: 0,
//         },
//         ticks: {
//           color: 'rgb(151 162 189)'
//         }
//       },
//       y: {
//         position: "right",
//         grid: {
//           lineWidth: 1,
//           color: "rgb(70 77 106)"
//         },
//         ticks: {
//           color: 'rgb(151 162 189)'
//         }
//       },
//     },
//     plugins: {
//       zoom: {
//         pan: {
//           enabled: true,
//           mode: 'x',
//         },
//         zoom: {
//           wheel: {
//             enabled: true,
//           },
//           pinch: {
//             enabled: true
//           },
//           mode: 'x',
//         }
//       },
//       legend: {
//         display: false,
//       },
//       title: {
//         display: false,
//       },
//     },
//   };

//   const data = {
//     labels: [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//     ],
//     datasets: [
//       {
//         label: "",
//         data: [33, 40, 45, 31, 44, 25, 20, 11, 34, 15, 44, 12],
//         fill: true,
//         backgroundColor: "rgb(104 83 147 / 31%)",
//         borderColor: "rgb(140 107 204)",
//       },
//     ],
//   };

//   return (
//     <div>
//       <Line data={data} options={options} />
//     </div>
//   );
// };

// export default MarketOverViewChart;

import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function MarketOverViewChart() {
  const chartRef = useRef();

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 1400,
      height: 600,
      priceScale: {
        scaleMargins: {
          top: 0.3,
          bottom: 0.25,
        },
        borderVisible: false,
      },
      layout: {
        backgroundColor: '#131722',
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0)',
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.6)',
        },
      },
    });
    const lineSeries = chart.addAreaSeries({
      topColor: '#9a75e2bf',
      bottomColor: '#9a75e242',
      lineColor: '#9a75e2',
      lineWidth: 2,
    });
    lineSeries.setData([
      { time: '2019-04-11', value: 80.01 },
      { time: '2019-04-12', value: 56.63 },
      { time: '2019-04-13', value: 46.64 },
      { time: '2019-04-14', value: 81.89 },
      { time: '2019-04-15', value: 34.43 },
      { time: '2019-04-16', value: 60.01 },
      { time: '2019-04-17', value: 96.63 },
      { time: '2019-04-18', value: 76.64 },
      { time: '2019-04-19', value: 81.89 },
      { time: '2019-04-20', value: 67.43 },
      { time: '2019-04-21', value: 14.43 },
      { time: '2019-04-22', value: 94.43 },
      { time: '2019-04-23', value: 34.43 },
      { time: '2019-04-24', value: 74.43 },
      { time: '2019-04-25', value: 44.43 },
      { time: '2019-04-26', value: 94.43 },
      { time: '2019-04-27', value: 24.43 },
    ]);
    chart.timeScale().fitContent();
  }, []);

  return <div ref={chartRef} />;
}

export default MarketOverViewChart;
