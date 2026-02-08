import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TeamMemberDashboard from '../components/TeamMemberDashboard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  FlagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { userProfile, currentUser, loading } = useAuth();

  // Show loading spinner while user profile loads
  if (loading || !userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Show team member dashboard for team members
  if (userProfile.role === 'team_member') {
    return (
      <Layout>
        <TeamMemberDashboard />
      </Layout>
    );
  }

  // Show founder dashboard below
  return <FounderDashboard userProfile={userProfile} currentUser={currentUser} />;
}

function FounderDashboard({ userProfile, currentUser }) {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 24,
    completedTasks: 15,
    pendingTasks: 9,
    totalMilestones: 5,
    completedMilestones: 2,
    progressScore: 68,
  });

  // Sample data for charts
  const taskCompletionData = [
    { name: 'Mon', completed: 3 },
    { name: 'Tue', completed: 5 },
    { name: 'Wed', completed: 2 },
    { name: 'Thu', completed: 4 },
    { name: 'Fri', completed: 6 },
    { name: 'Sat', completed: 3 },
    { name: 'Sun', completed: 2 },
  ];

  const tasksByStatus = [
    { name: 'To-Do', value: 8, color: '#a855f7' },
    { name: 'In Progress', value: 5, color: '#22d3ee' },
    { name: 'Completed', value: 12, color: '#34d399' },
  ];

  const tasksByPriority = [
    { name: 'Low', value: 8 },
    { name: 'Medium', value: 10 },
    { name: 'High', value: 6 },
  ];

  useEffect(() => {
    if (currentUser) {
      fetchSuggestions();
    }
  }, [currentUser]);

  const fetchSuggestions = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const getInsightType = (priority) => {
    if (priority === 'high') return 'warning';
    if (priority === 'medium') return 'info';
    return 'success';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {userProfile?.displayName || 'Founder'}!
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Here's what's happening with your startup today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Tasks */}
          <div className="overflow-hidden shadow-sm glass-card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-6 h-6" style={{ color: 'var(--neon-blue)' }} />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Tasks</dt>
                    <dd className="text-2xl font-bold text-white">{stats.totalTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-white/5 border-white/10">
              <div className="text-sm" style={{ color: 'var(--neon-blue)' }}>
                {stats.completedTasks} completed
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="overflow-hidden shadow-sm glass-card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Pending Tasks</dt>
                    <dd className="text-2xl font-bold text-white">{stats.pendingTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-white/5 border-white/10">
              <div className="text-sm text-orange-400">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="overflow-hidden shadow-sm glass-card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FlagIcon className="w-6 h-6" style={{ color: 'var(--neon-purple)' }} />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Milestones</dt>
                    <dd className="text-2xl font-bold text-white">{stats.totalMilestones}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-white/5 border-white/10">
              <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                {stats.completedMilestones} achieved
              </div>
            </div>
          </div>

          {/* Progress Score */}
          <div className="overflow-hidden shadow-sm glass-card" style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(168, 85, 247, 0.2))' }}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-300 truncate">Progress Score</dt>
                    <dd className="text-2xl font-bold text-white">{stats.progressScore}%</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-white/20">
              <div className="flex items-center text-sm text-white">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                On track for growth
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Task Completion Trend */}
          <div className="p-6 glass-card">
            <h3 className="mb-4 text-lg font-semibold text-white">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(34, 211, 238, 0.5)', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    color: '#fff' 
                  }} 
                  labelStyle={{ color: '#22d3ee' }}
                />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <Line type="monotone" dataKey="completed" stroke="var(--neon-blue)" strokeWidth={2} dot={{ fill: '#22d3ee', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Status */}
          <div className="p-6 glass-card">
            <h3 className="mb-4 text-lg font-semibold text-white">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth={2}
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: '1px solid rgba(34, 211, 238, 0.5)', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    color: '#fff' 
                  }} 
                  labelStyle={{ color: '#22d3ee' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9CA3AF' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="p-6 glass-card">
          <h3 className="mb-4 text-lg font-semibold text-white">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                  border: '1px solid rgba(34, 211, 238, 0.5)', 
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff' 
                }} 
                labelStyle={{ color: '#22d3ee' }}
                cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="value" fill="var(--neon-blue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* What Should I Do Next? - AI Insights */}
        <div className="p-6 glass-card" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))' }}>
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-7 w-7 mr-2" style={{ color: 'var(--neon-green)' }} />
            <h3 className="text-xl font-bold text-white">What Should I Do Next?</h3>
          </div>
          
          {suggestions.length === 0 ? (
            <p className="text-gray-400">Loading recommendations...</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const insightType = getInsightType(suggestion.priority);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 bg-white/5 ${
                      insightType === 'success'
                        ? 'border-[var(--neon-green)]'
                        : insightType === 'warning'
                        ? 'border-orange-400'
                        : 'border-[var(--neon-blue)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <h4 className="font-semibold text-white">{suggestion.action}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              suggestion.priority === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : suggestion.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {suggestion.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-gray-300">{suggestion.description}</p>
                        <p className="text-xs italic text-gray-400">{suggestion.category}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
