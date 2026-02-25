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

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const IndustrialChart = ({ data, color = '#3b82f6', unit = '' }) => {
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return <div className="text-gray-400 p-4">No data available</div>;
  }

  // Validate data before rendering - must be {x: Date, y: number}
  const validData = data.filter(d => {
    const isValid = d && d.x instanceof Date && typeof d.y === 'number' && !isNaN(d.y);
    if (!isValid && d) {
      console.warn('⚠️ Invalid point:', { got: d, xType: d?.x?.constructor?.name, yType: typeof d?.y });
    }
    return isValid;
  });

  if (validData.length === 0) {
    console.error('❌ CHART ERROR: No valid data points! Check data format.');
    console.error('Sample point:', data[0]);
    return <div className="text-red-500 p-4 font-bold">❌ Data format error</div>;
  }

  console.log(`✅ Chart rendering: ${validData.length} points, first X:`, validData[0].x, 'first Y:', validData[0].y);

  const chartData = {
    labels: [],  // Empty labels for time scale
    datasets: [
      {
        label: 'Sensor Data',
        data: validData,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,  // Increased thickness
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: color,
        pointBorderWidth: 0,
        segment: {
          borderColor: color,
          backgroundColor: color + '20',
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,  // Disable animation
    },
    parsing: false,
    normalized: true,
    plugins: {
      legend: { display: false },
      filler: { propagate: true },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: { size: 12, weight: 600 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y?.toFixed(1) || '0';
            return `${value} ${unit}`;
          },
        },
        cornerRadius: 8,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: 'time',
        min: validData[0].x,
        max: validData[validData.length - 1].x,
        time: {
          unit: 'minute',
          stepSize: 1,
          displayFormats: {
            minute: 'HH:mm',
            second: 'HH:mm:ss',
          },
        },
        grid: { display: true, color: 'rgba(200,200,200,0.2)' },
        ticks: { 
          color: '#666',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { display: true, color: 'rgba(200,200,200,0.2)' },
        ticks: { 
          color: '#666',
          maxTicksLimit: 5,
        },
      },
    },
  };

  useEffect(() => {
    if (!chartRef.current) {
      console.log('⚠️ Chart ref not ready');
      return;
    }
    
    try {
      const chart = chartRef.current;
      console.log('📈 Chart instance:', chart ? 'EXISTS' : 'NULL');
      console.log('📈 Chart state:', chart?.data?.datasets?.length, 'datasets');
      
      if (chart?.data?.datasets?.[0]) {
        // Apply gradient
        const ctx = chart.ctx;
        if (ctx && chart.height > 0) {
          const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
          gradient.addColorStop(0, color + 'cc');
          gradient.addColorStop(1, color + '00');
          chart.data.datasets[0].backgroundColor = gradient;
          console.log('✅ Gradient applied');
        }
        
        // Force redraw
        chart.update('none');
        console.log('✅ Chart redrawn');
      }
    } catch (e) {
      console.error('❌ Chart update error:', e.message);
    }
  }, [color, validData.length]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Line 
        ref={chartRef} 
        data={chartData} 
        options={options}
        redraw={true}
      />
    </div>
  );
};

export default IndustrialChart;
