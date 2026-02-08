import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Tasks() {
  const { currentUser, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
  });

  const isFounder = userProfile?.role === 'founder';

  useEffect(() => {
    if (currentUser && userProfile) {
      fetchTasks();
      if (isFounder) {
        fetchTeamMembers();
      }
    }
  }, [currentUser?.uid, userProfile?.role]); // Only re-run when user ID or role changes

  const fetchTasks = async () => {
    if (!currentUser) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Backend returns { tasks: [] }, extract the tasks array
      const tasksData = response.data?.tasks || response.data || [];
      
      // Filter tasks for team members
      let filteredTasks = tasksData;
      if (!isFounder) {
        filteredTasks = tasksData.filter(task => 
          task.assignedTo === currentUser.uid || 
          task.assignedToEmail === currentUser.email
        );
      }
      
      // If no tasks, use mock data
      if (filteredTasks.length === 0) {
        filteredTasks = getMockTasks();
      }
      
      setTasks(filteredTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Use mock data on error
      setTasks(getMockTasks());
      setLoading(false);
    }
  };

  const getMockTasks = () => {
    if (isFounder) {
      return [
        {
          id: 'mock-1',
          title: 'Complete MVP features',
          description: 'Finish core functionality for minimum viable product',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2026-02-20',
          assignedToName: 'Alex Chen',
          assignedToEmail: 'team@startup.com',
        },
        {
          id: 'mock-2',
          title: 'User research interviews',
          description: 'Conduct 10 user interviews to validate assumptions',
          status: 'todo',
          priority: 'high',
          dueDate: '2026-02-25',
          assignedToName: 'Jordan Smith',
          assignedToEmail: 'developer@startup.com',
        },
        {
          id: 'mock-3',
          title: 'Design system documentation',
          description: 'Document all design components and guidelines',
          status: 'in_progress',
          priority: 'medium',
          dueDate: '2026-03-01',
          assignedToName: 'Alex Chen',
          assignedToEmail: 'team@startup.com',
        },
        {
          id: 'mock-4',
          title: 'Setup analytics tracking',
          description: 'Implement Google Analytics and custom event tracking',
          status: 'todo',
          priority: 'medium',
          dueDate: '2026-02-28',
          assignedToName: 'Jordan Smith',
          assignedToEmail: 'developer@startup.com',
        },
        {
          id: 'mock-5',
          title: 'Competitor analysis',
          description: 'Research and document top 5 competitors',
          status: 'completed',
          priority: 'high',
          dueDate: '2026-02-10',
          assignedToName: 'Founder',
        },
        {
          id: 'mock-6',
          title: 'Write blog post',
          description: 'Create content for launch announcement',
          status: 'completed',
          priority: 'low',
          dueDate: '2026-02-08',
          assignedToName: 'Alex Chen',
          assignedToEmail: 'team@startup.com',
        },
      ];
    } else {
      return [
        {
          id: 'mock-1',
          title: 'Complete MVP features',
          description: 'Finish core functionality for minimum viable product',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2026-02-20',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: 'mock-2',
          title: 'Design system documentation',
          description: 'Document all design components and guidelines',
          status: 'in_progress',
          priority: 'medium',
          dueDate: '2026-03-01',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: 'mock-3',
          title: 'Write unit tests',
          description: 'Add test coverage for authentication module',
          status: 'todo',
          priority: 'medium',
          dueDate: '2026-02-22',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: 'mock-4',
          title: 'Review code changes',
          description: 'Review and merge pending pull requests',
          status: 'todo',
          priority: 'low',
          dueDate: '2026-02-18',
          assignedToName: userProfile?.displayName || 'You',
        },
        {
          id: 'mock-5',
          title: 'Write blog post',
          description: 'Create content for launch announcement',
          status: 'completed',
          priority: 'low',
          dueDate: '2026-02-08',
          assignedToName: userProfile?.displayName || 'You',
        },
      ];
    }
  };

  const fetchTeamMembers = async () => {
    if (!currentUser || !userProfile?.startupId) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/startups/${userProfile.startupId}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Mock data if API fails
      setTeamMembers([
        { uid: '1', displayName: 'Alex Chen (Co-Founder)', email: 'alex@startup.com' },
        { uid: '2', displayName: 'Jordan Smith (Developer)', email: 'jordan@startup.com' },
        { uid: '3', displayName: 'Priya Sharma (Designer)', email: 'priya@startup.com' },
        { uid: '4', displayName: 'Sam Wilson (Marketing)', email: 'sam@startup.com' },
      ]);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${API_BASE_URL}/tasks`,
        {
          ...newTask,
          startupId: userProfile.startupId,
          createdBy: currentUser.uid,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowNewTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
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
      fetchTasks();
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

  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'border-gray-500' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-500' },
    { id: 'completed', title: 'Completed', color: 'border-green-500' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--neon-blue)' }}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isFounder ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isFounder ? 'Manage and assign tasks to your team' : 'View and update your assigned tasks'}
            </p>
          </div>
          {isFounder && (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="text-white px-4 py-2 rounded-lg transition flex items-center"
              style={{ backgroundColor: 'var(--neon-blue)' }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-gray-800 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition hover:bg-gray-700"
          />
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((column) => (
            <div key={column.id} className="glass-card p-4 border-t-2 ${column.color}">
              <h3 className="font-semibold text-white mb-4">
                {column.title}{' '}
                <span className="text-sm text-gray-400">
                  ({groupedTasks[column.id]?.length || 0})
                </span>
              </h3>

              <div className="space-y-3">
                {(groupedTasks[column.id] || []).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white flex-1">{task.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{task.assignedToName || 'Unassigned'}</span>
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Status update dropdown (for all users) */}
                    <div className="mt-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(task.status)} border border-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer`}
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="todo" className="bg-gray-800 text-white">To Do</option>
                        <option value="in_progress" className="bg-gray-800 text-white">In Progress</option>
                        <option value="completed" className="bg-gray-800 text-white">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition hover:bg-gray-700"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition hover:bg-gray-700"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer hover:bg-gray-700"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                  >
                    <option value="low" className="bg-gray-800 text-white">Low</option>
                    <option value="medium" className="bg-gray-800 text-white">Medium</option>
                    <option value="high" className="bg-gray-800 text-white">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer hover:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <UserPlusIcon className="h-4 w-4 inline mr-1" />
                  Assign to Team Member
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer hover:bg-gray-700"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                >
                  <option value="" className="bg-gray-800 text-white">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.uid} value={member.uid} className="bg-gray-800 text-white">
                      {member.displayName || member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 text-white px-4 py-2 rounded-lg transition"
                  style={{ backgroundColor: 'var(--neon-blue)' }}
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
