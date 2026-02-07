import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const HealthMeter = () => {
  const { currentUser } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchHealthScore();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchHealthScore = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHealthData(response.data);
    } catch (error) {
      console.error('Error fetching health score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neon-blue)]"></div>
        </div>
      </Layout>
    );
  }

  if (!healthData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Unable to load health score. Please try again.</p>
        </div>
      </Layout>
    );
  }

  const { healthScore, riskLevel, riskColor, topRisks, metrics, recommendations } = healthData;

  // Calculate circle progress for gauge (radius = 70)
  const circumference = 2 * Math.PI * 70;
  const progress = circumference - (healthScore / 100) * circumference;

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Startup Health & Risk Meter
          </h1>
          <p className="mt-1 text-sm text-gray-300">
            Real-time assessment of your startup's execution health
          </p>
        </div>

      {/* Main Health Score */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Circular Gauge */}
          <div className="relative flex-shrink-0">
            <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="14"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={riskColor}
                strokeWidth="14"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ filter: `drop-shadow(0 0 8px ${riskColor})` }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold" style={{ color: riskColor }}>
                {healthScore}
              </span>
              <span className="text-gray-400 text-xs">Health Score</span>
            </div>
          </div>

          {/* Risk Level and Description */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: riskColor, boxShadow: `0 0 8px ${riskColor}` }}
                ></div>
                <h2 className="text-xl font-semibold" style={{ color: riskColor }}>
                  {riskLevel}
                </h2>
              </div>
              <p className="text-sm text-gray-300">
                {healthScore >= 80 && 'Your startup is executing well. Keep the momentum!'}
                {healthScore >= 60 && healthScore < 80 && 'Some areas need attention. Address risks proactively.'}
                {healthScore >= 40 && healthScore < 60 && 'Significant execution risks detected. Take immediate action.'}
                {healthScore < 40 && 'Critical situation. Focus on top priorities now.'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">Active Tasks</p>
                <p className="text-xl font-semibold text-white">{metrics.activeTasks}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">Overdue Tasks</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--neon-red, #ef4444)' }}>{metrics.overdueTasks}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">Completed Tasks</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--neon-green)' }}>{metrics.completedTasks}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">Recent Feedback</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--neon-blue)' }}>{metrics.recentFeedback}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 2 Risk Factors */}
      {topRisks && topRisks.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🚨</span> Top Risk Factors
          </h2>
          <div className="space-y-3">
            {topRisks.map((risk, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 bg-white/5 backdrop-blur-sm ${
                  risk.severity === 'high'
                    ? 'border-red-500'
                    : risk.severity === 'medium'
                    ? 'border-yellow-500'
                    : 'border-[var(--neon-blue)]'
                }`}
                style={{
                  boxShadow: risk.severity === 'high' 
                    ? '0 0 15px rgba(239, 68, 68, 0.15)' 
                    : risk.severity === 'medium'
                    ? '0 0 15px rgba(234, 179, 8, 0.15)'
                    : '0 0 15px rgba(34, 211, 238, 0.15)'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          risk.severity === 'high'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : risk.severity === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {risk.severity.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{risk.category}</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-1.5">{risk.description}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-medium text-[var(--neon-blue)]">💡 Recommendation:</span> {risk.recommendation}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400">Impact</p>
                    <p className="text-xl font-bold text-red-400">-{risk.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="glass-card p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>💡</span> Action Recommendations
          </h2>
          <ul className="space-y-2.5">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span 
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-blue), var(--neon-blue))',
                    boxShadow: '0 0 8px rgba(34, 211, 238, 0.3)'
                  }}
                >
                  {index + 1}
                </span>
                <span className="text-sm text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center pb-2">
        <button
          onClick={fetchHealthScore}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300"
          style={{
            background: 'linear-gradient(90deg, var(--primary-blue), var(--neon-blue))',
            boxShadow: '0 4px 15px rgba(34, 211, 238, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 0 20px rgba(34, 211, 238, 0.6)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 4px 15px rgba(34, 211, 238, 0.3)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔄 Refresh Health Score
        </button>
      </div>
      </div>
    </Layout>
  );
};

export default HealthMeter;
