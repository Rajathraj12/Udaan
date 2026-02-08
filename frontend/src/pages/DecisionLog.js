import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/decisions`, {
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
        `${process.env.REACT_APP_API_URL}/decisions`,
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
        `${process.env.REACT_APP_API_URL}/decisions/${id}`,
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
      strategic: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      product: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      hiring: 'bg-green-500/20 text-green-400 border border-green-500/30',
      fundraising: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      marketing: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      validated: 'bg-green-500/20 text-green-400 border border-green-500/30',
      invalidated: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Decision Log</h1>
            <p className="mt-1 text-sm text-gray-300">
              Track strategic decisions with reasoning and outcomes for accountability
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white rounded-lg transition text-sm"
            style={{ backgroundColor: 'var(--neon-blue)' }}
          >
            {showForm ? '✕ Cancel' : '+ Log Decision'}
          </button>
        </div>

      {/* Add Decision Form */}
      {showForm && (
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Log a New Decision</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Decision Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                style={{ focusRingColor: 'var(--neon-blue)' }}
                placeholder="e.g., Pivot to B2B model"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                style={{ focusRingColor: 'var(--neon-blue)' }}
              >
                <option value="strategic">Strategic</option>
                <option value="product">Product</option>
                <option value="hiring">Hiring</option>
                <option value="fundraising">Fundraising</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Context
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="What situation led to this decision?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Options Considered (one per line)
              </label>
              <textarea
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Chosen Option *
              </label>
              <input
                type="text"
                value={formData.chosenOption}
                onChange={(e) => setFormData({ ...formData, chosenOption: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                placeholder="What did you decide?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Reasoning *
              </label>
              <textarea
                value={formData.reasoning}
                onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="Why did you make this decision?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Data/Evidence Supporting Decision
              </label>
              <textarea
                value={formData.dataSupport}
                onChange={(e) => setFormData({ ...formData, dataSupport: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="What data or evidence supports this?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Expected Outcome
              </label>
              <textarea
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:outline-none"
                rows="2"
                placeholder="What do you expect to happen?"
              />
            </div>

            <button
              type="submit"
              className="w-full px-5 py-2.5 text-white rounded-lg transition text-sm font-semibold"
              style={{ backgroundColor: 'var(--neon-blue)' }}
            >
              Log Decision
            </button>
          </form>
        </div>
      )}

      {/* Decisions List */}
      {decisions.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-gray-400 mb-3">No decisions logged yet.</p>
          <p className="text-sm text-gray-500">
            Start tracking your strategic decisions to build accountability and learn from outcomes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <div key={decision.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">{decision.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(decision.category)}`}>
                      {decision.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(decision.status)}`}>
                      {decision.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {decision.createdAt?.toDate ? decision.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {decision.context && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-400">Context:</p>
                  <p className="text-sm text-gray-300">{decision.context}</p>
                </div>
              )}

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-400">Chosen Option:</p>
                <p className="text-sm text-white font-semibold">{decision.chosenOption}</p>
              </div>

              <div className="mb-2">
                <p className="text-sm font-medium text-gray-400">Reasoning:</p>
                <p className="text-sm text-gray-300">{decision.reasoning}</p>
              </div>

              {decision.dataSupport && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-400">Data/Evidence:</p>
                  <p className="text-sm text-gray-300">{decision.dataSupport}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
                <div>
                  <p className="text-sm font-medium text-gray-400">Expected Outcome:</p>
                  <p className="text-sm text-gray-300">{decision.expectedOutcome || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Actual Outcome:</p>
                  {decision.actualOutcome ? (
                    <p className="text-sm text-gray-300">{decision.actualOutcome}</p>
                  ) : (
                    <button
                      onClick={() => {
                        const outcome = prompt('Enter the actual outcome:');
                        if (outcome) {
                          updateOutcome(decision.id, outcome, 'validated');
                        }
                      }}
                      className="text-sm font-medium"
                      style={{ color: 'var(--neon-blue)' }}
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
    </Layout>
  );
};

export default DecisionLog;
