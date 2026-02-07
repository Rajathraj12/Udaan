import React from 'react';
import Layout from '../components/Layout';

export default function Feedback() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback & Validation</h1>
            <p className="mt-1 text-sm text-gray-600">Collect and analyze feedback from stakeholders</p>
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            Create Feedback Form
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-700">"Great product idea! Love the UI/UX."</p>
                  <p className="text-xs text-gray-500 mt-2">- Customer #{i} • 2 days ago</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Metrics</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Hypothesis Validated</span>
                  <span className="text-green-600 font-bold">12</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Needs Iteration</span>
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
