import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const AssumptionBoard = () => {
  const { currentUser } = useAuth();
  const [assumptions, setAssumptions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hypothesis: '',
    category: 'customer',
    priority: 'medium',
    testMethod: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      const [assumptionsRes, feedbackRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/assumptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAssumptions(assumptionsRes.data);
      setFeedbacks(feedbackRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assumptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/assumptions`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Assumption created!');
      setShowForm(false);
      setFormData({
        hypothesis: '',
        category: 'customer',
        priority: 'medium',
        testMethod: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating assumption:', error);
      toast.error('Failed to create assumption');
    }
  };

  const linkFeedback = async (assumptionId, feedbackId, supportsHypothesis) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/assumptions/${assumptionId}/link-feedback`,
        { feedbackId, supportsHypothesis },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Feedback linked!');
      fetchData();
    } catch (error) {
      console.error('Error linking feedback:', error);
      toast.error('Failed to link feedback');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      customer: 'bg-blue-600 text-white',
      problem: 'bg-red-600 text-white',
      solution: 'bg-green-600 text-white',
      market: 'bg-purple-600 text-white',
      'business model': 'bg-yellow-600 text-white',
    };
    return colors[category] || 'bg-gray-600 text-white';
  };

  const getStatusColor = (status) => {
    const colors = {
      untested: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      testing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      validated: 'bg-green-500/20 text-green-400 border border-green-500/30',
      invalidated: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-green-600 text-white',
    };
    return colors[priority] || 'bg-gray-600 text-white';
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

  // Group by status
  const grouped = {
    untested: assumptions.filter(a => a.status === 'untested'),
    testing: assumptions.filter(a => a.status === 'testing'),
    validated: assumptions.filter(a => a.status === 'validated'),
    invalidated: assumptions.filter(a => a.status === 'invalidated'),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Assumption Board</h1>
            <p className="mt-2 text-sm text-gray-400">
              Track hypotheses and link customer feedback for validation
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
          >
            {showForm ? '✕ Cancel' : '+ Add Assumption'}
          </button>
        </div>

      {/* Add Assumption Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Assumption</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Hypothesis Statement *
              </label>
              <textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                rows="3"
                placeholder="e.g., Small businesses struggle with manual invoicing and would pay $50/month for automation"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer hover:bg-gray-700"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                >
                  <option value="customer" className="bg-gray-800 text-white">Customer</option>
                  <option value="problem" className="bg-gray-800 text-white">Problem</option>
                  <option value="solution" className="bg-gray-800 text-white">Solution</option>
                  <option value="market" className="bg-gray-800 text-white">Market</option>
                  <option value="business model" className="bg-gray-800 text-white">Business Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition cursor-pointer hover:bg-gray-700"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                >
                  <option value="high" className="bg-gray-800 text-white">High</option>
                  <option value="medium" className="bg-gray-800 text-white">Medium</option>
                  <option value="low" className="bg-gray-800 text-white">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Test Method
                </label>
                <input
                  type="text"
                  value={formData.testMethod}
                  onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="e.g., 10 interviews"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/30"
            >
              Add Assumption
            </button>
          </form>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['untested', 'testing', 'validated', 'invalidated'].map((status) => (
          <div key={status} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white capitalize">{status}</h3>
              <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-sm font-bold">
                {grouped[status].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[status].map((assumption) => (
                <div 
                  key={assumption.id} 
                  className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all"
                >
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryColor(assumption.category)}`}>
                      {assumption.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getPriorityColor(assumption.priority)}`}>
                      {assumption.priority}
                    </span>
                  </div>

                  {/* Hypothesis */}
                  <p className="text-sm text-gray-200 leading-relaxed mb-3 min-h-[40px]">
                    {assumption.hypothesis}
                  </p>

                  {/* Validation Score */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-400 font-medium">Validation</span>
                      <span className="font-bold text-white">{assumption.validationScore || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (assumption.validationScore || 0) >= 70
                            ? 'bg-green-500'
                            : (assumption.validationScore || 0) >= 30
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${assumption.validationScore || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {assumption.evidence?.length || 0} evidence item(s)
                    </p>
                  </div>

                  {/* Link Feedback Button */}
                  <button
                    onClick={() => {
                      toast.success('Link copied successfully!');
                    }}
                    className="w-full text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    + Link Feedback
                  </button>
                </div>
              ))}

              {grouped[status].length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-600 text-4xl mb-2">📋</div>
                  <p className="text-sm text-gray-500">No items</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-5">Validation Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-400 mb-1">{grouped.untested.length}</p>
            <p className="text-sm text-gray-400 font-medium">Untested</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400 mb-1">{grouped.testing.length}</p>
            <p className="text-sm text-blue-300 font-medium">Testing</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400 mb-1">{grouped.validated.length}</p>
            <p className="text-sm text-green-300 font-medium">Validated</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400 mb-1">{grouped.invalidated.length}</p>
            <p className="text-sm text-red-300 font-medium">Invalidated</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AssumptionBoard;
