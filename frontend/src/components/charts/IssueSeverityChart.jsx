import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SEVERITY_COLORS = {
  Minor: '#6B7280',
  Major: '#D97706',
  Critical: '#C86B4A',
  Blocker: '#DC2626',
};

export const IssueSeverityChart = ({ data = [] }) => {
  const filteredData = data.filter((item) => item.count > 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-sand-500 italic">
        No active issues to display
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="count"
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={SEVERITY_COLORS[entry.name] || '#2F6B5F'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E8E3D8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
