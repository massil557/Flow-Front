

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
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler);

const IndustrialChart = ({ data, color = '#3b82f6', unit = '', critValue = 0 }) => {
  const { t } = useTranslation();
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

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const chartData = {
    datasets: [
      {
        label: t('chart.sensor_data'),
        data: validData,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 1.5,
        pointBackgroundColor: color,
      },
      // The Constant Function (Critical Value Line)
      {
        label: t('chart.critical_threshold'),
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
        grid: { display: true, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,200,200,0.2)' },
        ticks: { color: isDark ? '#94a3b8' : undefined },
      },
      y: {
        grid: { display: true, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,200,200,0.2)' },
        ticks: { color: isDark ? '#94a3b8' : undefined },
      },
    },
  };

  return <Line ref={chartRef} data={chartData} options={options} redraw={true} />;
};

export default IndustrialChart;