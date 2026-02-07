import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  FlagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function TeamMemberDashboard() {
  const { userProfile, currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    if (currentUser) {
      fetchMyTasks();
    }
  }, [currentUser?.uid]); // Only re-fetch when user ID changes

  const fetchMyTasks = async () => {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { assignedTo: currentUser.uid }
      });

      const myTasks = response.data.filter(task => 
        task.assignedTo === currentUser.uid || 
        task.assignedToEmail === currentUser.email
      );

      // If no tasks from API, use mock data for demo
      const tasksToUse = myTasks.length > 0 ? myTasks : [
        {
          id: '1',
          title: 'Complete user authentication flow',
          description: 'Implement login, signup, and password reset functionality',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2026-02-15',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '2',
          title: 'Design landing page mockups',
          description: 'Create initial design mockups for the startup landing page',
          status: 'todo',
          priority: 'medium',
          dueDate: '2026-02-20',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '3',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated deployment pipeline using GitHub Actions',
          status: 'todo',
          priority: 'low',
          dueDate: '2026-02-25',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '4',
          title: 'Write API documentation',
          description: 'Document all API endpoints with request/response examples',
          status: 'in_progress',
          priority: 'medium',
          dueDate: '2026-02-18',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '5',
          title: 'Review pull request #42',
          description: 'Code review for the new analytics dashboard feature',
          status: 'completed',
          priority: 'high',
          dueDate: '2026-02-10',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '6',
          title: 'Update project dependencies',
          description: 'Update all npm packages to latest stable versions',
          status: 'completed',
          priority: 'low',
          dueDate: '2026-02-08',
          assignedToName: userProfile?.displayName || 'You',
        },
      ];

      setTasks(tasksToUse);
      
      // Calculate stats
      setStats({
        totalTasks: tasksToUse.length,
        inProgressTasks: tasksToUse.filter(t => t.status === 'in_progress').length,
        completedTasks: tasksToUse.filter(t => t.status === 'completed').length,
        pendingTasks: tasksToUse.filter(t => t.status === 'todo').length,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      // Use mock data on error
      const mockTasks = [
        {
          id: '1',
          title: 'Complete user authentication flow',
          description: 'Implement login, signup, and password reset functionality',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2026-02-15',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '2',
          title: 'Design landing page mockups',
          description: 'Create initial design mockups for the startup landing page',
          status: 'todo',
          priority: 'medium',
          dueDate: '2026-02-20',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '3',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated deployment pipeline using GitHub Actions',
          status: 'todo',
          priority: 'low',
          dueDate: '2026-02-25',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '4',
          title: 'Write API documentation',
          description: 'Document all API endpoints with request/response examples',
          status: 'in_progress',
          priority: 'medium',
          dueDate: '2026-02-18',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '5',
          title: 'Review pull request #42',
          description: 'Code review for the new analytics dashboard feature',
          status: 'completed',
          priority: 'high',
          dueDate: '2026-02-10',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: '6',
          title: 'Update project dependencies',
          description: 'Update all npm packages to latest stable versions',
          status: 'completed',
          priority: 'low',
          dueDate: '2026-02-08',
          assignedToName: userProfile?.displayName || 'You',
        },
      ];
      
      setTasks(mockTasks);
      setStats({
        totalTasks: mockTasks.length,
        inProgressTasks: mockTasks.filter(t => t.status === 'in_progress').length,
        completedTasks: mockTasks.filter(t => t.status === 'completed').length,
        pendingTasks: mockTasks.filter(t => t.status === 'todo').length,
      });
      
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_BASE_URL}/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'in_progress': return 'text-blue-400 bg-blue-500/10';
      case 'todo': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="p-6 glass-card">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Welcome back, {userProfile?.displayName || 'Team Member'}! 👋
        </h1>
        <p className="text-gray-400">
          Here are your assigned tasks and progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={FlagIcon}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pendingTasks}
          icon={ClockIcon}
          color="gray"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={UserIcon}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* My Tasks */}
      <div className="p-6 glass-card">
        <h2 className="mb-4 text-2xl font-bold text-white">My Assigned Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <FlagIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 transition border rounded-lg bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-400">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(task.status)} border-0 focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    gray: 'text-gray-400 bg-gray-500/10',
  };

  return (
    <div className="p-6 glass-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
