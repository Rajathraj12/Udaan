import React from 'react';
import Layout from '../components/Layout';

export default function Feedback() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Feedback & Validation</h1>
            <p className="mt-1 text-sm text-gray-300">Collect and analyze feedback from stakeholders</p>
          </div>
          <button className="px-4 py-2 rounded-lg transition" style={{ backgroundColor: 'var(--neon-blue)', color: 'white' }}>
            Create Feedback Form
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-[var(--neon-green)] bg-white/5 p-4 rounded">
                  <p className="text-sm text-gray-300">"Great product idea! Love the UI/UX."</p>
                  <p className="text-xs text-gray-400 mt-2">- Customer #{i} • 2 days ago</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Validation Metrics</h3>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-300">Hypothesis Validated</span>
                  <span className="font-bold" style={{ color: 'var(--neon-green)' }}>12</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '75%', backgroundColor: 'var(--neon-green)' }} />
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-300">Needs Iteration</span>
                  <span className="text-orange-400 font-bold">4</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
