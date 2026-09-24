import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            {label} {required && <span className="text-terracotta-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-subtle">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sand-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            required={required}
            className={`block w-full rounded-lg border bg-white text-sm text-charcoal-800 placeholder:text-sand-400 focus:outline-none focus:ring-2 transition-all ${
              Icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2 ${
              error
                ? 'border-terracotta-400 focus:border-terracotta-500 focus:ring-terracotta-200'
                : 'border-sand-300 focus:border-forest-500 focus:ring-forest-100'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-terracotta-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-sand-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
