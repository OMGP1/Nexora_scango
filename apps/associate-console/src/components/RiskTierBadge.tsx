import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface RiskTierBadgeProps {
  tier: 1 | 2 | 3;
  score?: number;
}

export const RiskTierBadge: React.FC<RiskTierBadgeProps> = ({ tier, score }) => {
  const configs = {
    1: { label: 'Safe', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', Icon: CheckCircle },
    2: { label: 'Warning', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', Icon: AlertTriangle },
    3: { label: 'High Risk', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', Icon: AlertOctagon },
  };

  const config = configs[tier] || configs[1];
  const { label, color, bg, border, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg} ${color} ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
      {score !== undefined && (
        <span className="ml-1 opacity-75">({score})</span>
      )}
    </span>
  );
};
