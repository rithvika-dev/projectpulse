import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = {
  Backlog: '#ABA08E',
  'To Do': '#D97706',
  'In Progress': '#2F6B5F',
  Review: '#C86B4A',
  Done: '#10B981',
};

export const TaskDistributionChart = ({ data = [] }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#EBE5DA" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8C8271"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#DDD5C5' }}
          />
          <YAxis
            stroke="#8C8271"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E8E3D8',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
            cursor={{ fill: '#F5F2EC' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || '#2F6B5F'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
