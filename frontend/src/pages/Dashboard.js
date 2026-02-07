import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
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
  const { userProfile, currentUser } = useAuth();
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
    { name: 'To-Do', value: 5, color: '#6b7280' },
    { name: 'In Progress', value: 4, color: '#3b82f6' },
    { name: 'Completed', value: 15, color: '#10b981' },
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/suggestions`, {
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
          <div className="bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Tasks</dt>
                    <dd className="text-2xl font-bold text-white">{stats.totalTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border-t border-gray-700 px-5 py-3">
              <div className="text-sm text-blue-400">
                {stats.completedTasks} completed
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Pending Tasks</dt>
                    <dd className="text-2xl font-bold text-white">{stats.pendingTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border-t border-gray-700 px-5 py-3">
              <div className="text-sm text-orange-400">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FlagIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Milestones</dt>
                    <dd className="text-2xl font-bold text-white">{stats.totalMilestones}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border-t border-gray-700 px-5 py-3">
              <div className="text-sm text-purple-400">
                {stats.completedMilestones} achieved
              </div>
            </div>
          </div>

          {/* Progress Score */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-blue-100 truncate">Progress Score</dt>
                    <dd className="text-2xl font-bold text-white">{stats.progressScore}%</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-5 py-3">
              <div className="text-sm text-white flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                On track for growth
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Completion Trend */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <Line type="monotone" dataKey="completed" stroke="#60A5FA" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by Status */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tasks by Status</h3>
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
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="value" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* What Should I Do Next? - AI Insights */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg shadow-sm border border-gray-600">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-7 w-7 text-yellow-400 mr-2" />
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
                    className={`p-4 rounded-lg border-l-4 bg-gray-900 ${
                      insightType === 'success'
                        ? 'border-green-500'
                        : insightType === 'warning'
                        ? 'border-orange-500'
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <h4 className="font-semibold text-gray-900">{suggestion.action}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              suggestion.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : suggestion.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {suggestion.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                        <p className="text-xs text-gray-500 italic">{suggestion.category}</p>
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
