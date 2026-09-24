import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-forest-500 text-white hover:bg-forest-600 focus:ring-forest-500 shadow-sm active:bg-forest-700',
    secondary:
      'bg-terracotta-500 text-white hover:bg-terracotta-600 focus:ring-terracotta-500 shadow-sm active:bg-terracotta-700',
    outline:
      'border border-sand-300 text-charcoal-700 bg-white hover:bg-sand-50 hover:border-sand-400 focus:ring-forest-500 shadow-subtle',
    ghost:
      'text-charcoal-700 hover:bg-sand-100 hover:text-charcoal-900 focus:ring-forest-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm active:bg-red-800',
    accent:
      'bg-amberGold-500 text-charcoal-900 hover:bg-amberGold-600 focus:ring-amberGold-500 shadow-sm active:bg-amberGold-700',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
