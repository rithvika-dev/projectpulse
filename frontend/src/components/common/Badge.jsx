import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variants = {
    forest: 'bg-forest-50 text-forest-700 border-forest-200',
    terracotta: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
    amber: 'bg-amberGold-50 text-amberGold-800 border-amberGold-200',
    neutral: 'bg-sand-100 text-charcoal-700 border-sand-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-none',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  // Map known status/priority strings to variants automatically if string passed
  let resolvedVariant = variant;
  if (typeof children === 'string') {
    const text = children.toLowerCase();
    if (['done', 'completed', 'active', 'resolved', 'low'].includes(text)) resolvedVariant = 'forest';
    else if (['in progress', 'review', 'medium'].includes(text)) resolvedVariant = 'amber';
    else if (['critical', 'blocker', 'delayed'].includes(text)) resolvedVariant = 'critical';
    else if (['high', 'major'].includes(text)) resolvedVariant = 'terracotta';
    else if (['backlog', 'planned', 'not started', 'open'].includes(text)) resolvedVariant = 'neutral';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        variants[resolvedVariant] || variants.neutral
      } ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            resolvedVariant === 'critical'
              ? 'bg-red-500'
              : resolvedVariant === 'forest' || resolvedVariant === 'active'
              ? 'bg-forest-600'
              : resolvedVariant === 'amber'
              ? 'bg-amberGold-600'
              : resolvedVariant === 'terracotta'
              ? 'bg-terracotta-600'
              : 'bg-sand-500'
          }`}
        />
      )}
      {children}
    </span>
  );
};
