import React from 'react';
import Layout from '../components/Layout';

export default function Settings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
              <div className="flex items-center">
                <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-600">Receive email updates about your tasks</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Reports</label>
              <div className="flex items-center">
                <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                <span className="ml-2 text-sm text-gray-600">Get weekly progress reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
