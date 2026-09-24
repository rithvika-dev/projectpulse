import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-sand-200 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all -mb-[1px] ${
              isActive
                ? 'border-forest-500 text-forest-700 font-semibold bg-forest-50/50'
                : 'border-transparent text-sand-600 hover:text-charcoal-800 hover:border-sand-300'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-forest-600' : 'text-sand-500'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive
                    ? 'bg-forest-100 text-forest-800'
                    : 'bg-sand-200 text-charcoal-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
