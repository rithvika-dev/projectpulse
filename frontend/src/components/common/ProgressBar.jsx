import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  size = 'md',
  variant = 'forest',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const barColors = {
    forest: 'bg-forest-500',
    terracotta: 'bg-terracotta-500',
    amber: 'bg-amberGold-500',
    emerald: 'bg-emerald-500',
  };

  let resolvedColor = barColors[variant] || barColors.forest;
  if (variant === 'auto') {
    if (percentage >= 80) resolvedColor = barColors.forest;
    else if (percentage >= 40) resolvedColor = barColors.amber;
    else resolvedColor = barColors.terracotta;
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-sand-600 mb-1">
          <span>Progress</span>
          <span className="text-charcoal-800 font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-sand-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${resolvedColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
