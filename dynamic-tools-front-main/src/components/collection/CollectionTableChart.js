import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, Filler, LinearScale, LineElement, PointElement, BarElement, Title, Tooltip, Legend);

function CollectionTableChart({ items = [], currency, type, coefficient }) {
  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          display: false,
        },
        display: false,
      },
      y: {
        ticks: {
          display: false,
        },
        display: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        displayColors: false,
      },
    },
    interaction: { mode: 'index' },
    onHover(e) {
      // eslint-disable-next-line react/no-this-in-sfc
      const points = this.getElementsAtEventForMode(e, 'index', { axis: 'x', intersect: true }, false);

      if (points.length) e.native.target.style.cursor = 'pointer';
      else e.native.target.style.cursor = 'default';
    },
  };

  const labels = items.map((item) => (item ? `${((item || 0) * coefficient).toFixed(5)} ${currency}` : ''));
  const volumeData = items.map((item) => ((item || 0) * coefficient).toFixed(5));

  const data = {
    labels,
    datasets: [
      {
        // barThickness: 15,
        fill: true,
        minBarLength: 5,
        label: '',
        data: volumeData,
        backgroundColor: type === 'bar' ? 'rgb(74,238,232)' : 'rgba(154, 117, 226, 0.25)',
        borderColor: type === 'bar' ? 'rgb(74,238,232)' : '#9a75e2',
      },
    ],
  };

  if (type === 'bar') {
    return <Bar options={options} data={data} width={80} height={40} />;
  }

  if (type === 'line') {
    return <Line options={options} data={data} width={80} height={40} />;
  }

  return null;
}

export default CollectionTableChart;
