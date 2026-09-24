import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  placeholder = 'Select option...',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
          {label} {required && <span className="text-terracotta-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`appearance-none block w-full rounded-lg border bg-white text-sm text-charcoal-800 focus:outline-none focus:ring-2 transition-all pl-3.5 pr-10 py-2 shadow-subtle ${
            error
              ? 'border-terracotta-400 focus:border-terracotta-500 focus:ring-terracotta-200'
              : 'border-sand-300 focus:border-forest-500 focus:ring-forest-100'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sand-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-terracotta-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-sand-500">{helperText}</p>
      )}
    </div>
  );
};
