import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { connect } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.register(zoomPlugin);

function AnalyticsChart({ lowestStatus, highestStatus, averageStatus, volumeStatus }) {
  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          lineWidth: 0,
        },
      },
      y: {
        position: 'right',
        grid: {
          lineWidth: 1,
          color: 'rgb(70 77 106)',
        },
        ticks: {
          color: 'rgb(151 162 189)',
          // padding:50
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

  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'January',
    'February',
    'March',
  ];

  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'lowest line',
        data: lowestStatus
          ? [30, 55, 51, 52, 40, 47, 40, 30, 55, 51, 52, 40, 47, 40, 30, 55, 51, 52, 40, 47, 40, 53, 24, 54]
          : [],
        borderColor: 'rgb(255, 99, 132)',
      },
      {
        type: 'line',
        label: 'average line',
        data: averageStatus
          ? [40, 45, 50, 55, 47, 42, 40, 45, 50, 55, 47, 42, 40, 45, 50, 55, 47, 42, 40, 45, 50, 55, 47, 42]
          : [],
        fill: false,
        borderColor: 'rgb(245 86 251)',
      },
      {
        type: 'line',
        label: 'highest line',
        data: highestStatus
          ? [60, 70, 80, 81, 82, 73, 60, 70, 80, 81, 82, 73, 60, 70, 80, 81, 82, 73, 60, 70, 80, 81, 82, 73]
          : [],
        fill: false,
        borderColor: 'rgb(52 211 153)',
      },
      {
        type: 'bar',
        label: 'volume',
        data: volumeStatus
          ? [10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40]
          : [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(129 129 129)',
      },
    ],
  };

  return <Bar options={options} data={data} className="analyticsChart" />;
}

const mapStateToProps = (state) => {
  return {
    lowestStatus: state.collection.analyticeTabRadioButtonStatus.lowestSalePrice,
    highestStatus: state.collection.analyticeTabRadioButtonStatus.highestSalePrice,
    averageStatus: state.collection.analyticeTabRadioButtonStatus.averageSalePrice,
    volumeStatus: state.collection.analyticeTabRadioButtonStatus.volume,
  };
};

export default connect(mapStateToProps)(AnalyticsChart);
