import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, FlagIcon } from '@heroicons/react/24/outline';

export default function Milestones() {
  const { userProfile } = useAuth();
  const isFounder = userProfile?.role === 'founder';

  const milestones = [
    {
      id: 1,
      title: 'MVP Launch',
      description: 'Complete and launch minimum viable product to early users',
      targetDate: '2026-03-15',
      status: 'in-progress',
      progress: 65,
      tasks: 12,
      completedTasks: 8,
    },
    {
      id: 2,
      title: 'First 100 Users',
      description: 'Acquire and onboard first 100 active users',
      targetDate: '2026-04-01',
      status: 'not-started',
      progress: 20,
      tasks: 8,
      completedTasks: 0,
    },
    {
      id: 3,
      title: 'Product-Market Fit',
      description: 'Validate product-market fit with user feedback and metrics',
      targetDate: '2026-05-01',
      status: 'not-started',
      progress: 0,
      tasks: 10,
      completedTasks: 0,
    },
    {
      id: 4,
      title: 'Seed Funding Round',
      description: 'Close seed funding round with target investors',
      targetDate: '2026-06-01',
      status: 'not-started',
      progress: 0,
      tasks: 15,
      completedTasks: 0,
    },
  ];

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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Milestone
            </button>
          )}
        </div>

        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="glass-card p-6 hover:bg-white/10 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <FlagIcon className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Target: {new Date(milestone.targetDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                  <span className="font-semibold text-white">{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{milestone.completedTasks}</span> of{' '}
                  <span className="text-white font-semibold">{milestone.tasks}</span> tasks completed
                </div>
                {milestone.progress > 0 && (
                  <div className="text-sm text-gray-500">
                    {Math.ceil((new Date(milestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {milestones.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FlagIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No milestones yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your startup's major achievements</p>
            {isFounder && (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Create First Milestone
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
