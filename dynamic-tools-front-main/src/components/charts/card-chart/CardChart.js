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

function CardChart() {
  const options = {
    responsive: true,
    scales: {
      x: {
        display: false,
        grid: {
          lineWidth: 0,
        },
        ticks: {
          color: 'rgb(151 162 189)',
        },
      },
      y: {
        display: false,
        grid: {
          lineWidth: 1,
          color: 'rgb(70 77 106)',
        },
        ticks: {
          color: 'rgb(151 162 189)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    elements: {
      point: {
        borderWidth: 0,
        radius: 10,
        backgroundColor: 'rgba(0,0,0,0)',
      },
    },
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '',
        data: [33, 40, 45, 31, 44, 25, 20, 11, 34, 15, 44, 12],
        fill: true,
        backgroundColor: 'rgb(54 68 247 / 20%)',
        borderColor: 'rgb(54 68 247 / 80%)',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },
    ],
  };

  return <Line data={data} options={options} />;
}

export default CardChart;
