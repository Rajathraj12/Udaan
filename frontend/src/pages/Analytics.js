import React from 'react';
import Layout from '../components/Layout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const weeklyData = [
    { week: 'Week 1', tasks: 5, milestones: 0 },
    { week: 'Week 2', tasks: 8, milestones: 1 },
    { week: 'Week 3', tasks: 12, milestones: 0 },
    { week: 'Week 4', tasks: 15, milestones: 2 },
  ];

  const teamProductivity = [
    { name: 'John Doe', tasks: 12 },
    { name: 'Jane Smith', tasks: 10 },
    { name: 'Mike Johnson', tasks: 8 },
  ];

  const feedbackSentiment = [
    { name: 'Positive', value: 24, color: '#10b981' },
    { name: 'Neutral', value: 8, color: '#6b7280' },
    { name: 'Negative', value: 3, color: '#ef4444' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-300">
            Gain insights from your data to make better decisions
          </p>
        </div>

        {/* Progress Overview */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Line type="monotone" dataKey="tasks" stroke="var(--neon-blue)" strokeWidth={2} name="Tasks Completed" />
              <Line type="monotone" dataKey="milestones" stroke="var(--neon-green)" strokeWidth={2} name="Milestones Achieved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Productivity */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Team Productivity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={teamProductivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }} />
                <Bar dataKey="tasks" fill="var(--neon-blue)" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feedback Sentiment */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Feedback Sentiment</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={feedbackSentiment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feedbackSentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
