import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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
      customer: 'bg-blue-100 text-blue-800',
      problem: 'bg-red-100 text-red-800',
      solution: 'bg-green-100 text-green-800',
      market: 'bg-purple-100 text-purple-800',
      'business model': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      untested: 'bg-gray-100 text-gray-800',
      testing: 'bg-blue-100 text-blue-800',
      validated: 'bg-green-100 text-green-800',
      invalidated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assumption Board</h1>
          <p className="mt-2 text-gray-600">
            Track hypotheses and link customer feedback for validation
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Assumption'}
        </button>
      </div>

      {/* Add Assumption Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Assumption</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hypothesis Statement *
              </label>
              <textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="e.g., Small businesses struggle with manual invoicing and would pay $50/month for automation"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="customer">Customer</option>
                  <option value="problem">Problem</option>
                  <option value="solution">Solution</option>
                  <option value="market">Market</option>
                  <option value="business model">Business Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Method
                </label>
                <input
                  type="text"
                  value={formData.testMethod}
                  onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 10 interviews"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Add Assumption
            </button>
          </form>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['untested', 'testing', 'validated', 'invalidated'].map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">{status}</h3>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                {grouped[status].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[status].map((assumption) => (
                <div key={assumption.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(assumption.category)}`}>
                      {assumption.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(assumption.priority)}`}>
                      {assumption.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{assumption.hypothesis}</p>

                  {/* Validation Score */}
                  {assumption.evidence && assumption.evidence.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Validation</span>
                        <span className="font-medium">{assumption.validationScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            assumption.validationScore >= 70
                              ? 'bg-green-500'
                              : assumption.validationScore >= 30
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${assumption.validationScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
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
                    className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Link Feedback
                  </button>
                </div>
              ))}

              {grouped[status].length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No items</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">{grouped.untested.length}</p>
            <p className="text-sm text-gray-600">Untested</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{grouped.testing.length}</p>
            <p className="text-sm text-gray-600">Testing</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{grouped.validated.length}</p>
            <p className="text-sm text-gray-600">Validated</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{grouped.invalidated.length}</p>
            <p className="text-sm text-gray-600">Invalidated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionBoard;
