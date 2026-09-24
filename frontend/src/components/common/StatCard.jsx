import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'forest',
  trend,
  className = '',
}) => {
  const iconVariants = {
    forest: 'bg-forest-50 text-forest-600 border-forest-100',
    terracotta: 'bg-terracotta-50 text-terracotta-600 border-terracotta-100',
    amber: 'bg-amberGold-50 text-amberGold-700 border-amberGold-100',
    neutral: 'bg-sand-100 text-charcoal-600 border-sand-200',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-sand-200 p-5 shadow-card hover-card flex items-start justify-between ${className}`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-charcoal-900 mt-1 tracking-tight">
          {value}
        </h4>
        {subtitle && (
          <p className="text-xs text-sand-500 mt-1.5 flex items-center gap-1">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.positive ? 'text-forest-600' : 'text-terracotta-600'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            iconVariants[variant] || iconVariants.forest
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
