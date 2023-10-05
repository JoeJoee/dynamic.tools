import React from 'react';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);
ChartJS.register(zoomPlugin);

export const options = {
  scales: {
    x: {
      beginAtZero: false,
      grid: {
        lineWidth: 0,
      },
      ticks: {
        color: 'rgb(151 162 189)',
      },
    },
    y: {
      beginAtZero: true,
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

export const data = {
  labels: ['value'],
  datasets: [
    {
      label: '',
      data: [
        { x: 78.7, y: 1.84, r: 8 },
        { x: 69.1, y: 2.44, r: 8 },
        { x: 74.7, y: 1.78, r: 8 },
        { x: 76.9, y: 2.21, r: 8 },
        { x: 53, y: 5.59, r: 8 },
        { x: 70.9, y: 1.75, r: 8 },
        { x: 83.8, y: 1.46, r: 8 },
        { x: 82.5, y: 1.83, r: 8 },
        { x: 71.3, y: 3.31, r: 8 },
        { x: 81.6, y: 1.81, r: 8 },
        { x: 62.1, y: 4.26, r: 8 },
        { x: 69.6, y: 4.51, r: 8 },
        { x: 60.7, y: 4.65, r: 8 },
        { x: 52.7, y: 6, r: 8 },
        { x: 68.4, y: 2.94, r: 8 },
        { x: 70, y: 2.17, r: 8 },
        { x: 71.2, y: 1.51, r: 8 },
        { x: 83.4, y: 1.62, r: 8 },
        { x: 64.6, y: 4.28, r: 8 },
        { x: 74.6, y: 1.5, r: 8 },
        { x: 74.2, y: 1.88, r: 8 },
        { x: 74.44, y: 2.34, r: 8 },
        { x: 57.4, y: 2.34, r: 8 },
        { x: 59.2, y: 3.86, r: 8 },
        { x: 55.9, y: 4.63, r: 8 },
      ],
      backgroundColor: 'rgb(97 78 139)',
      borderColor: 'rgb(255 255 255)',
    },
  ],
};

export default function CollectionSalesGraph() {
  return <Bubble options={options} data={data} />;
}
