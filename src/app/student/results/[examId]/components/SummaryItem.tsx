import React from 'react';

interface SummaryItemProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default SummaryItem;
