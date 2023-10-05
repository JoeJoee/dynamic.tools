import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { connect } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function AnalyticsSideChart() {
//   return <Bar options={options} data={data} className="analyticsSideChart" />;
// }

function AnalyticsSideChart() {
  const options = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        display: false,
        reverse: true,
      },
      y: {
        display: false,
        position: 'right',
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
        type: 'bar',
        label: 'Bar Dataset',
        data: [10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40, 10, 20, 30, 40],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(235 98 38)',
      },
    ],
  };

  return <Bar options={options} data={data} className="analyticsSideChart" />;
}

const mapStateToProps = (state) => {
  return {
    activeGraphStatus: state.collection.analyticeTabRadioButtonStatus.volume,
  };
};

export default connect(mapStateToProps)(AnalyticsSideChart);
