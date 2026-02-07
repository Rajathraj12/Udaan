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

  const handleInputChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                Startup Profile
              </h1>
              <p className="mt-2 text-gray-300">Manage your startup information and team</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              style={{
                background: editing 
                  ? 'linear-gradient(90deg, var(--neon-blue), var(--neon-green))' 
                  : 'linear-gradient(90deg, var(--primary-blue), var(--neon-blue))',
                color: 'white',
                boxShadow: editing 
                  ? '0 0 20px rgba(34, 211, 238, 0.5)' 
                  : 'none',
              }}
            >
              {editing ? '💾 Save Changes' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Startup Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
                style={{
                  background: editing ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: editing ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: editing ? 'text' : 'not-allowed',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
                style={{
                  background: editing ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: editing ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: editing ? 'text' : 'not-allowed',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Stage</label>
              <select
                value={profile.stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
                style={{
                  background: editing ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: editing ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: editing ? 'pointer' : 'not-allowed',
                }}
              >
                <option style={{background: '#1a1a2e', color: 'white'}}>Idea</option>
                <option style={{background: '#1a1a2e', color: 'white'}}>MVP</option>
                <option style={{background: '#1a1a2e', color: 'white'}}>Early Traction</option>
                <option style={{background: '#1a1a2e', color: 'white'}}>Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
              <input
                type="number"
                value={profile.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
                style={{
                  background: editing ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: editing ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: editing ? 'text' : 'not-allowed',
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!editing}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-300"
                style={{
                  background: editing ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: editing ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: editing ? 'text' : 'not-allowed',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Team Members
          </h2>
          <div className="space-y-3">
            {[
              { name: 'John Doe', role: 'Founder', email: 'john@startup.com' },
              { name: 'Jane Smith', role: 'Co-Founder', email: 'jane@startup.com' },
              { name: 'Mike Johnson', role: 'Team Member', email: 'mike@startup.com' },
            ].map((member, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                    }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                </div>
                <span 
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: member.role === 'Founder' 
                      ? 'rgba(34, 211, 238, 0.2)'
                      : member.role === 'Co-Founder'
                      ? 'rgba(168, 85, 247, 0.2)'
                      : 'rgba(52, 211, 153, 0.2)',
                    color: member.role === 'Founder'
                      ? 'var(--neon-blue)'
                      : member.role === 'Co-Founder'
                      ? 'var(--neon-purple)'
                      : 'var(--neon-green)',
                    border: `1px solid ${
                      member.role === 'Founder'
                        ? 'var(--neon-blue)'
                        : member.role === 'Co-Founder'
                        ? 'var(--neon-purple)'
                        : 'var(--neon-green)'
                    }`,
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
          <button 
            className="mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(34, 211, 238, 0.1)',
              border: '2px solid var(--neon-blue)',
              color: 'var(--neon-blue)',
            }}
          >
            + Invite Team Member
          </button>
        </div>
      </div>
    </Layout>
  );
}
