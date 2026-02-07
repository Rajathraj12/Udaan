import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!readinessData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load investor readiness. Please try again.</p>
      </div>
    );
  }

  const { currentStage, readinessScore, stageProgress, nextActions, canAdvance, nextStage } = readinessData;

  const stageOrder = ['idea', 'mvp', 'traction', 'investorReady'];
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investor Readiness Timeline</h1>
          <p className="mt-2 text-gray-600">
            Track your journey from idea to investor-ready startup
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Overall Readiness</p>
          <p className="text-4xl font-bold text-primary-600">{readinessScore}%</p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStageIndex / 3) * 100}%` }}
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
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold z-10 transition-all ${
                      isPast
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isPast ? '✓' : index + 1}
                  </div>

                  {/* Stage Name */}
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      isActive ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    {stageData.name}
                  </p>

                  {/* Progress Badge */}
                  <span
                    className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stageData.unlocked
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
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
          <div className="mt-8 text-center">
            <button
              onClick={advanceStage}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition font-semibold"
            >
              🚀 Advance to {stageProgress[nextStage].name}
            </button>
          </div>
        )}
      </div>

      {/* Current Stage Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📋 {stageProgress[currentStage].name} Checklist
        </h2>
        
        <div className="space-y-3">
          {stageProgress[currentStage].criteria.map((criterion, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                criterion.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {criterion.type === 'manual' ? (
                <input
                  type="checkbox"
                  checked={criterion.completed}
                  onChange={() => toggleManualCheck(criterion.id, criterion.completed)}
                  className="mt-1 h-5 w-5 text-primary-600 rounded cursor-pointer"
                />
              ) : (
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-1 ${
                    criterion.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {criterion.completed && '✓'}
                </div>
              )}

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    criterion.completed ? 'text-green-800 line-through' : 'text-gray-900'
                  }`}
                >
                  {criterion.label}
                </p>
                {criterion.type !== 'manual' && (
                  <p className="text-sm text-gray-500 mt-1">
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
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Recommended Next Actions</h2>
          <ul className="space-y-2">
            {nextActions.map((action, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Stages Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 All Stages Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stageOrder.map((stage) => {
            const stageData = stageProgress[stage];
            return (
              <div
                key={stage}
                className={`p-4 rounded-lg border-2 ${
                  stage === currentStage
                    ? 'border-primary-600 bg-primary-50'
                    : stageData.unlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{stageData.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stageData.unlocked
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {stageData.unlocked ? 'UNLOCKED' : `${stageData.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${stageData.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stageData.criteria.filter((c) => c.completed).length} of{' '}
                  {stageData.criteria.length} criteria met
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvestorReadiness;
