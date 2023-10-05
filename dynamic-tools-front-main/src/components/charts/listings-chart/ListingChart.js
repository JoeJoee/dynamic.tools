import React from 'react';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
} from 'chart.js';

Chart.register(zoomPlugin);
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);

function ListingChart() {
  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          lineWidth: 0,
        },
        ticks: {
          color: 'rgb(151 162 189)',
          padding: 20,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          lineWidth: 1,
          color: 'rgb(70 77 106)',
        },
        ticks: {
          color: 'rgb(151 162 189)',
          padding: 20,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(151 162 189)',
          padding: 20,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '',
        data: [12, 45, 12, 43, 55, 23, 12, 45, 12, 43, 55, 23],
        borderColor: 'rgb(154 117 226)',
      },
    ],
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
}

export default ListingChart;
