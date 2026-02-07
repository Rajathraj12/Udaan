import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DecisionLog = () => {
  const { currentUser } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    options: '',
    chosenOption: '',
    reasoning: '',
    dataSupport: '',
    expectedOutcome: '',
    category: 'strategic',
  });

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/decisions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDecisions(response.data);
    } catch (error) {
      console.error('Error fetching decisions:', error);
      toast.error('Failed to load decisions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const optionsArray = formData.options.split('\n').filter(o => o.trim());
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/decisions`,
        {
          ...formData,
          options: optionsArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Decision logged!');
      setShowForm(false);
      setFormData({
        title: '',
        context: '',
        options: '',
        chosenOption: '',
        reasoning: '',
        dataSupport: '',
        expectedOutcome: '',
        category: 'strategic',
      });
      fetchDecisions();
    } catch (error) {
      console.error('Error creating decision:', error);
      toast.error('Failed to log decision');
    }
  };

  const updateOutcome = async (id, actualOutcome, status) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/decisions/${id}`,
        { actualOutcome, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Outcome updated!');
      fetchDecisions();
    } catch (error) {
      console.error('Error updating outcome:', error);
      toast.error('Failed to update outcome');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      strategic: 'bg-purple-100 text-purple-800',
      product: 'bg-blue-100 text-blue-800',
      hiring: 'bg-green-100 text-green-800',
      fundraising: 'bg-yellow-100 text-yellow-800',
      marketing: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      validated: 'bg-green-100 text-green-800',
      invalidated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Decision Log</h1>
          <p className="mt-2 text-gray-600">
            Track strategic decisions with reasoning and outcomes for accountability
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? '✕ Cancel' : '+ Log Decision'}
        </button>
      </div>

      {/* Add Decision Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Log a New Decision</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Pivot to B2B model"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="strategic">Strategic</option>
                <option value="product">Product</option>
                <option value="hiring">Hiring</option>
                <option value="fundraising">Fundraising</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="2"
                placeholder="What situation led to this decision?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options Considered (one per line)
              </label>
              <textarea
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chosen Option *
              </label>
              <input
                type="text"
                value={formData.chosenOption}
                onChange={(e) => setFormData({ ...formData, chosenOption: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="What did you decide?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reasoning *
              </label>
              <textarea
                value={formData.reasoning}
                onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Why did you make this decision?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data/Evidence Supporting Decision
              </label>
              <textarea
                value={formData.dataSupport}
                onChange={(e) => setFormData({ ...formData, dataSupport: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="2"
                placeholder="What data or evidence supports this?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Outcome
              </label>
              <textarea
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="2"
                placeholder="What do you expect to happen?"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Log Decision
            </button>
          </form>
        </div>
      )}

      {/* Decisions List */}
      {decisions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No decisions logged yet.</p>
          <p className="text-sm text-gray-400">
            Start tracking your strategic decisions to build accountability and learn from outcomes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <div key={decision.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{decision.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(decision.category)}`}>
                      {decision.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(decision.status)}`}>
                      {decision.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {decision.createdAt?.toDate ? decision.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {decision.context && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Context:</p>
                  <p className="text-gray-600">{decision.context}</p>
                </div>
              )}

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Chosen Option:</p>
                <p className="text-gray-900 font-semibold">{decision.chosenOption}</p>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Reasoning:</p>
                <p className="text-gray-600">{decision.reasoning}</p>
              </div>

              {decision.dataSupport && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Data/Evidence:</p>
                  <p className="text-gray-600">{decision.dataSupport}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Outcome:</p>
                  <p className="text-gray-600">{decision.expectedOutcome || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Actual Outcome:</p>
                  {decision.actualOutcome ? (
                    <p className="text-gray-600">{decision.actualOutcome}</p>
                  ) : (
                    <button
                      onClick={() => {
                        const outcome = prompt('Enter the actual outcome:');
                        if (outcome) {
                          updateOutcome(decision.id, outcome, 'validated');
                        }
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Outcome
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionLog;
