import React from 'react';

interface ClusterMetrics {
  visitAch: number;
  leadAch: number;
  sanctionAch: number;
  disbAch: number;
}

interface ClusterPerformanceCardProps {
  clusterName: string;
  metrics: ClusterMetrics;
}

const ClusterPerformanceCard: React.FC<ClusterPerformanceCardProps> = ({
  clusterName,
  metrics
}) => {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusDot = (percentage: number) => (
    <div className={`w-3 h-3 rounded-full ${getStatusColor(percentage)}`} />
  );

  const MetricRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {getStatusDot(value)}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`font-semibold ${
        value >= 100 ? 'text-green-600' : 
        value >= 80 ? 'text-yellow-600' : 
        'text-red-600'
      }`}>
        {value}%
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{clusterName}</h3>
      <div className="space-y-2">
        <MetricRow label="Visit Achievement" value={metrics.visitAch} />
        <MetricRow label="Lead Achievement" value={metrics.leadAch} />
        <MetricRow label="Sanction Achievement" value={metrics.sanctionAch} />
        <MetricRow label="Disbursement Achievement" value={metrics.disbAch} />
      </div>
    </div>
  );
};

export default ClusterPerformanceCard; 