// // import React, { useRef, useEffect } from 'react';
// // import { Line } from 'react-chartjs-2';
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   TimeScale,
// //   PointElement,
// //   LineElement,
// //   Tooltip,
// //   Filler,
// // } from 'chart.js';
// // import 'chartjs-adapter-date-fns';

// // ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler);

// // const IndustrialChart = ({ data, color = '#3b82f6', unit = '' }) => {
// //   const chartRef = useRef(null);
// //   const validData = data?.filter(d => d && d.x instanceof Date && typeof d.y === 'number' && !isNaN(d.y)) || [];

// //   useEffect(() => {
// //     const chart = chartRef.current;
// //     if (chart && chart.ctx && chart.height > 0) {
// //       const ctx = chart.ctx;
// //       const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
// //       gradient.addColorStop(0, color + 'cc');
// //       gradient.addColorStop(1, color + '00');
// //       chart.data.datasets[0].backgroundColor = gradient;
// //       chart.update('none');
// //     }
// //   }, [color, validData.length]);

// //   const chartData = {
// //     labels: [],
// //     datasets: [{
// //       label: 'Sensor Data',
// //       data: validData,
// //       borderColor: color,
// //       backgroundColor: color + '20',
// //       borderWidth: 3,
// //       fill: true,
// //       tension: 0.3,
// //       pointRadius: 2,
// //       pointBackgroundColor: color,
// //     }],
// //   };

// //   const options = {
// //     responsive: true,
// //     maintainAspectRatio: false,
// //     animation: { duration: 0 },
// //     plugins: {
// //       legend: { display: false },
// //       tooltip: {
// //         enabled: true,
// //         mode: 'nearest',
// //         intersect: false,
// //         backgroundColor: 'rgba(30, 41, 59, 0.95)',
// //         callbacks: {
// //           label: (context) => `${context.parsed.y?.toFixed(1) || '0'} ${unit}`,
// //         },
// //       },
// //     },
// //     scales: {
// //       x: {
// //         type: 'time',
// //         time: { unit: 'minute', displayFormats: { minute: 'HH:mm' } },
// //         grid: { display: true, color: 'rgba(200,200,200,0.2)' },
// //       },
// //       y: { grid: { display: true, color: 'rgba(200,200,200,0.2)' } },
// //     },
// //   };

// //   return <Line ref={chartRef} data={chartData} options={options} redraw={true} />;
// // };

// // export default IndustrialChart;

// import React, { useRef, useEffect } from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Filler,
// } from 'chart.js';
// import 'chartjs-adapter-date-fns';

// ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler);

// const IndustrialChart = ({ data, color = '#3b82f6', unit = '', critValue = 0 }) => {
//   const chartRef = useRef(null);
//   const validData = data?.filter(d => d && d.x instanceof Date && typeof d.y === 'number' && !isNaN(d.y)) || [];

//   useEffect(() => {
//     const chart = chartRef.current;
//     if (chart && chart.ctx && chart.height > 0) {
//       const ctx = chart.ctx;
//       const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
//       gradient.addColorStop(0, color + 'cc');
//       gradient.addColorStop(1, color + '00');
//       chart.data.datasets[0].backgroundColor = gradient;
//       chart.update('none');
//     }
//   }, [color, validData.length]);

//   const chartData = {
//     datasets: [
//       {
//         label: 'Sensor Data',
//         data: validData,
//         borderColor: color,
//         backgroundColor: color + '20',
//         borderWidth: 3,
//         fill: true,
//         tension: 0.3,
//         pointRadius: 2,
//       },
//       // CRITICAL VALUE LINE (Constant Function)
//       {
//         label: 'Critical Limit',
//         data: validData.map(p => ({ x: p.x, y: critValue })),
//         borderColor: '#ff4d4d', // Red for critical
//         borderWidth: 2,
//         borderDash: [5, 5],    // Dashed line
//         fill: false,
//         pointRadius: 0,        // No dots on the limit line
//         tension: 0,            // Straight line
//       }
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: { duration: 0 },
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         enabled: true,
//         mode: 'index',
//         intersect: false,
//         backgroundColor: 'rgba(30, 41, 59, 0.95)',
//       },
//     },
//     scales: {
//       x: {
//         type: 'time',
//         time: { unit: 'minute', displayFormats: { minute: 'HH:mm' } },
//         grid: { display: true, color: 'rgba(200,200,200,0.2)' },
//       },
//       y: { grid: { display: true, color: 'rgba(200,200,200,0.2)' } },
//     },
//   };

//   return <Line ref={chartRef} data={chartData} options={options} redraw={true} />;
// };

// export default IndustrialChart;
import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler);

const IndustrialChart = ({ data, color = '#3b82f6', unit = '', critValue = 0 }) => {
  const chartRef = useRef(null);
  const validData = data?.filter(d => d && d.x instanceof Date && typeof d.y === 'number' && !isNaN(d.y)) || [];

  useEffect(() => {
    const chart = chartRef.current;
    if (chart && chart.ctx && chart.height > 0) {
      const ctx = chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
      gradient.addColorStop(0, color + 'cc');
      gradient.addColorStop(1, color + '00');
      chart.data.datasets[0].backgroundColor = gradient;
      chart.update('none');
    }
  }, [color, validData.length]);

  const chartData = {
    datasets: [
      {
        label: 'Sensor Data',
        data: validData,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: color,
      },
      // The Constant Function (Critical Value Line)
      {
        label: 'Critical Threshold',
        data: validData.map(p => ({ x: p.x, y: critValue })),
        borderColor: '#ef4444', // Red color
        borderWidth: 2,
        borderDash: [6, 6],    // Dashed line
        fill: false,
        pointRadius: 0,
        tension: 0,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'minute', displayFormats: { minute: 'HH:mm' } },
        grid: { display: true, color: 'rgba(200,200,200,0.2)' },
      },
      y: { grid: { display: true, color: 'rgba(200,200,200,0.2)' } },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} redraw={true} />;
};

export default IndustrialChart;