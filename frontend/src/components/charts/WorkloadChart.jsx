import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const WorkloadChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    name: item.user?.name || item.member?.name || 'Member',
    completed: item.completedTasks || 0,
    inProgress: item.inProgressTasks || 0,
    pending: item.pendingTasks || 0,
    storyPoints: item.totalPoints || item.storyPoints || 0,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
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
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar
            dataKey="completed"
            name="Done"
            fill="#10B981"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="inProgress"
            name="In Progress"
            fill="#2F6B5F"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="pending"
            name="Pending"
            fill="#DDD5C5"
            stackId="a"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
