import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Milestones() {
  const { userProfile, currentUser } = useAuth();
  const isFounder = userProfile?.role === 'founder';
  
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/milestones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMilestones(response.data.milestones || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/milestones`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Milestone created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', targetDate: '' });
      fetchMilestones();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Milestones</h1>
            <p className="mt-1 text-sm text-gray-400">
              {isFounder ? 'Track your major achievements and goals' : 'View milestone progress'}
            </p>
          </div>
          {isFounder && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Milestone
            </button>
          )}
        </div>

        {/* Add Milestone Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create New Milestone</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Milestone Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:outline-none"
                    style={{ focusRingColor: 'var(--neon-blue)' }}
                    placeholder="e.g., MVP Launch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:outline-none"
                    rows="3"
                    placeholder="Describe the milestone..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {milestones.map((milestone) => {
            const linkedTasks = milestone.linkedTasks || [];
            const completedTasks = linkedTasks.filter(t => t.completed).length;
            const totalTasks = linkedTasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return (
              <div key={milestone.id} className="glass-card p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <FlagIcon className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{milestone.description || 'No description'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      milestone.status === 'in-progress'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : milestone.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {milestone.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold text-white">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="text-white font-semibold">{completedTasks}</span> of{' '}
                    <span className="text-white font-semibold">{totalTasks}</span> tasks completed
                  </div>
                  {milestone.targetDate && new Date(milestone.targetDate) > new Date() && (
                    <div className="text-sm text-gray-500">
                      {Math.ceil((new Date(milestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {milestones.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FlagIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No milestones yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your startup's major achievements</p>
            {isFounder && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create First Milestone
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
