import React from 'react';

interface KPIMetricCardProps {
  title: string;
  target: number;
  actual: number;
  achievement: number;
  icon?: React.ReactNode;
}

const KPIMetricCard: React.FC<KPIMetricCardProps> = ({
  title,
  target,
  actual,
  achievement,
  icon
}) => {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {icon && <div className="text-2xl text-blue-600">{icon}</div>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Target</p>
          <p className="text-xl font-bold text-gray-800">{target.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Actual</p>
          <p className="text-xl font-bold text-gray-800">{actual.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ach%</p>
          <p className={`text-xl font-bold ${
            achievement >= 100 ? 'text-green-600' : 
            achievement >= 80 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {achievement}%
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getStatusColor(achievement)} transition-all duration-500`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default KPIMetricCard; 