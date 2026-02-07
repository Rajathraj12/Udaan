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
      customer: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      problem: 'bg-red-500/20 text-red-400 border border-red-500/30',
      solution: 'bg-green-500/20 text-green-400 border border-green-500/30',
      market: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      'business model': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
      high: 'bg-red-500/20 text-red-400 border border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border border-green-500/30',
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Assumption Board</h1>
            <p className="mt-1 text-sm text-gray-300">
              Track hypotheses and link customer feedback for validation
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white rounded-lg transition text-sm"
            style={{ backgroundColor: 'var(--neon-blue)' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Assumption'}
          </button>
        </div>

      {/* Add Assumption Form */}
      {showForm && (
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Add New Assumption</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Hypothesis Statement *
              </label>
              <textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="e.g., Small businesses struggle with manual invoicing and would pay $50/month for automation"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="problem">Problem</option>
                  <option value="solution">Solution</option>
                  <option value="market">Market</option>
                  <option value="business model">Business Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Test Method
                </label>
                <input
                  type="text"
                  value={formData.testMethod}
                  onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                  placeholder="e.g., 10 interviews"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-5 py-2.5 text-white rounded-lg transition text-sm font-semibold"
              style={{ backgroundColor: 'var(--neon-blue)' }}
            >
              Add Assumption
            </button>
          </form>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {['untested', 'testing', 'validated', 'invalidated'].map((status) => (
          <div key={status} className="glass-card p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white capitalize">{status}</h3>
              <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                {grouped[status].length}
              </span>
            </div>

            <div className="space-y-2.5">
              {grouped[status].map((assumption) => (
                <div key={assumption.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(assumption.category)}`}>
                      {assumption.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(assumption.priority)}`}>
                      {assumption.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-2">{assumption.hypothesis}</p>

                  {/* Validation Score */}
                  {assumption.evidence && assumption.evidence.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Validation</span>
                        <span className="font-medium text-white">{assumption.validationScore}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            assumption.validationScore >= 70
                              ? 'bg-green-500'
                              : assumption.validationScore >= 30
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${assumption.validationScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {assumption.evidence.length} evidence item(s)
                      </p>
                    </div>
                  )}

                  {/* Link Feedback Button */}
                  <button
                    onClick={() => {
                      const feedbackId = prompt(`Select feedback to link:\n\n${feedbacks.map((f, i) => `${i + 1}. ${f.source} - ${f.summary || 'No summary'}`).join('\n')}\n\nEnter number:`);
                      if (feedbackId && feedbacks[parseInt(feedbackId) - 1]) {
                        const supports = window.confirm('Does this feedback SUPPORT the hypothesis? (OK = Yes, Cancel = No)');
                        linkFeedback(assumption.id, feedbacks[parseInt(feedbackId) - 1].id, supports);
                      }
                    }}
                    className="w-full text-xs font-medium"
                    style={{ color: 'var(--neon-blue)' }}
                  >
                    + Link Feedback
                  </button>
                </div>
              ))}

              {grouped[status].length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Validation Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{grouped.untested.length}</p>
            <p className="text-xs text-gray-300">Untested</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--neon-blue)' }}>{grouped.testing.length}</p>
            <p className="text-xs text-gray-300">Testing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--neon-green)' }}>{grouped.validated.length}</p>
            <p className="text-xs text-gray-300">Validated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{grouped.invalidated.length}</p>
            <p className="text-xs text-gray-300">Invalidated</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AssumptionBoard;
