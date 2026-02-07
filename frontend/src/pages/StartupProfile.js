import React, { useState } from 'react';
import Layout from '../components/Layout';

export default function StartupProfile() {
  const [profile, setProfile] = useState({
    name: 'TechStartup Inc.',
    industry: 'SaaS',
    stage: 'MVP',
    description: 'Building the future of startup operations',
    foundedDate: '2026-01-01',
    teamSize: 3,
  });

  const [editing, setEditing] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startup Profile</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your startup information</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Startup Name</label>
              <input
                type="text"
                value={profile.name}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input
                type="text"
                value={profile.industry}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={profile.stage}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              >
                <option>Idea</option>
                <option>MVP</option>
                <option>Early Traction</option>
                <option>Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
              <input
                type="number"
                value={profile.teamSize}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={profile.description}
                disabled={!editing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', role: 'Founder', email: 'john@startup.com' },
              { name: 'Jane Smith', role: 'Co-Founder', email: 'jane@startup.com' },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
            + Invite Team Member
          </button>
        </div>
      </div>
    </Layout>
  );
}
