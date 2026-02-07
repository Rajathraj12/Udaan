import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const InvestorReadiness = () => {
  const { currentUser } = useAuth();
  const [readinessData, setReadinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadinessStatus();
  }, []);

  const fetchReadinessStatus = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/investor-readiness`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReadinessData(response.data);
    } catch (error) {
      console.error('Error fetching investor readiness:', error);
      toast.error('Failed to load investor readiness status');
    } finally {
      setLoading(false);
    }
  };

  const toggleManualCheck = async (criterionId, currentValue) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/investor-readiness/manual-check`,
        { criterionId, completed: !currentValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Updated!');
      fetchReadinessStatus();
    } catch (error) {
      console.error('Error updating manual check:', error);
      toast.error('Failed to update');
    }
  };

  const advanceStage = async () => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/investor-readiness/advance-stage`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('🎉 Advanced to next stage!');
      fetchReadinessStatus();
    } catch (error) {
      console.error('Error advancing stage:', error);
      toast.error('Failed to advance stage');
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

  if (!readinessData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Unable to load investor readiness. Please try again.</p>
        </div>
      </Layout>
    );
  }

  const { currentStage, readinessScore, stageProgress, nextActions, canAdvance, nextStage } = readinessData;

  const stageOrder = ['idea', 'mvp', 'traction', 'investorReady'];
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Investor Readiness Timeline</h1>
            <p className="mt-1 text-sm text-gray-300">
              Track your journey from idea to investor-ready startup
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Overall Readiness</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--neon-blue)' }}>{readinessScore}%</p>
          </div>
        </div>

      {/* Visual Timeline */}
      <div className="glass-card p-5">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-8 left-0 right-0 h-2 bg-white/10 rounded-full">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                background: 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))',
                width: `${(currentStageIndex / 3) * 100}%`
              }}
            ></div>
          </div>

          {/* Stage Nodes */}
          <div className="relative flex justify-between">
            {stageOrder.map((stage, index) => {
              const stageData = stageProgress[stage];
              const isActive = stage === currentStage;
              const isPast = index < currentStageIndex;
              const isFuture = index > currentStageIndex;

              return (
                <div key={stage} className="flex flex-col items-center" style={{ width: '25%' }}>
                  {/* Node Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold z-10 transition-all ${
                      isPast
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'text-white ring-4'
                        : 'bg-white/10 text-gray-400'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--neon-blue)', borderColor: 'rgba(34, 211, 238, 0.3)' } : {}}
                  >
                    {isPast ? '✓' : index + 1}
                  </div>

                  {/* Stage Name */}
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                    style={isActive ? { color: 'var(--neon-blue)' } : {}}
                  >
                    {stageData.name}
                  </p>

                  {/* Progress Badge */}
                  <span
                    className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      stageData.unlocked
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {stageData.progress}% Complete
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advance Button */}
        {canAdvance && (
          <div className="mt-6 text-center">
            <button
              onClick={advanceStage}
              className="px-5 py-2.5 text-white rounded-lg transition font-semibold"
              style={{ background: 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))' }}
            >
              🚀 Advance to {stageProgress[nextStage].name}
            </button>
          </div>
        )}
      </div>

      {/* Current Stage Details */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-3">
          📋 {stageProgress[currentStage].name} Checklist
        </h2>
        
        <div className="space-y-2.5">
          {stageProgress[currentStage].criteria.map((criterion, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                criterion.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {criterion.type === 'manual' ? (
                <input
                  type="checkbox"
                  checked={criterion.completed}
                  onChange={() => toggleManualCheck(criterion.id, criterion.completed)}
                  className="mt-1 h-4 w-4 rounded cursor-pointer"
                  style={{ accentColor: 'var(--neon-blue)' }}
                />
              ) : (
                <div
                  className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-1 text-xs ${
                    criterion.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {criterion.completed && '✓'}
                </div>
              )}

              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    criterion.completed ? 'text-green-400 line-through' : 'text-white'
                  }`}
                >
                  {criterion.label}
                </p>
                {criterion.type !== 'manual' && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Auto-tracked from your {criterion.type} data
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Actions */}
      {nextActions && nextActions.length > 0 && (
        <div className="glass-card p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h2 className="text-lg font-semibold text-white mb-3">🎯 Recommended Next Actions</h2>
          <ul className="space-y-2">
            {nextActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: 'var(--neon-blue)' }}>
                  {index + 1}
                </span>
                <span className="text-sm text-gray-300">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Stages Overview */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-3">📊 All Stages Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stageOrder.map((stage) => {
            const stageData = stageProgress[stage];
            return (
              <div
                key={stage}
                className={`p-3 rounded-lg border-2 ${
                  stage === currentStage
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : stageData.unlocked
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{stageData.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      stageData.unlocked
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {stageData.unlocked ? 'UNLOCKED' : `${stageData.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${stageData.progress}%`, background: 'var(--neon-blue)' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stageData.criteria.filter((c) => c.completed).length} of{' '}
                  {stageData.criteria.length} criteria met
                </p>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default InvestorReadiness;
