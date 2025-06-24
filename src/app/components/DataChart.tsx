import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'bar' | 'pie' | 'line';

interface DataChartProps {
  type: ChartType;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
  title: string;
  height?: number;
  darkMode?: boolean;
}

export default function DataChart({ type, labels, datasets, title, height = 400, darkMode = false }: DataChartProps) {
  // Validate inputs to prevent chart.js errors
  if (!labels || !Array.isArray(labels) || labels.length === 0) {
    return (
      <div 
        style={{ height: `${height}px`, width: '100%' }}
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
      >
        <p className="text-gray-500">No data labels available for chart</p>
      </div>
    );
  }

  if (!datasets || !Array.isArray(datasets) || datasets.length === 0) {
    return (
      <div 
        style={{ height: `${height}px`, width: '100%' }}
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
      >
        <p className="text-gray-500">No datasets available for chart</p>
      </div>
    );
  }

  // Validate each dataset has data
  const validDatasets = datasets.filter(ds => 
    ds && Array.isArray(ds.data) && ds.data.length > 0
  );

  if (validDatasets.length === 0) {
    return (
      <div 
        style={{ height: `${height}px`, width: '100%' }}
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
      >
        <p className="text-gray-500">No valid data available for chart</p>
      </div>
    );
  }

  // Colors based on theme
  const textColor = darkMode ? 'white' : '#333333';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        },
      },
      title: {
        display: true,
        text: title || 'Chart',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold'
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      x: {
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10
          }
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US').format(value);
          },
          font: {
            size: 10
          }
        },
        grid: {
          color: gridColor,
        },
        beginAtZero: true,
      },
    } : undefined,
  };

  const data = {
    labels,
    datasets: validDatasets,
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      {type === 'bar' && <Bar options={options} data={data} />}
      {type === 'pie' && <Pie options={options} data={data} />}
      {type === 'line' && <Line options={options} data={data} />}
    </div>
  );
} 