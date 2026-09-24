import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search projects, tasks, issues...',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sand-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-9 pr-8 py-2 text-sm bg-white border border-sand-300 rounded-lg text-charcoal-800 placeholder:text-sand-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 transition-all shadow-subtle"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-sand-400 hover:text-charcoal-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
