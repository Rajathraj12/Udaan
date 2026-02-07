import React from 'react';
import Layout from '../components/Layout';

export default function Milestones() {
  const milestones = [
    {
      id: 1,
      title: 'MVP Launch',
      targetDate: '2026-03-15',
      status: 'in-progress',
      progress: 65,
      tasks: 12,
      completedTasks: 8,
    },
    {
      id: 2,
      title: 'First 100 Users',
      targetDate: '2026-04-01',
      status: 'not-started',
      progress: 0,
      tasks: 8,
      completedTasks: 0,
    },
    {
      id: 3,
      title: 'Seed Funding Round',
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
            <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
            <p className="mt-1 text-sm text-gray-600">Track your major achievements</p>
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    milestone.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {milestone.status.replace('-', ' ')}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {milestone.completedTasks} of {milestone.tasks} tasks completed
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
