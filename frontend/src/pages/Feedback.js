import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function Feedback() {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    purpose: '',
    questions: [],
    targetAudience: '',
    contextNote: ''
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [startupId, setStartupId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchStartupId();
    }
  }, [currentUser]);

  const fetchStartupId = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/startups/my-startup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStartupId(data.id);
      }
    } catch (error) {
      console.error('Error fetching startup:', error);
    }
  };

  const purposes = [
    { id: 'problem', name: 'Validate Problem', icon: '🎯', description: 'Test if the problem exists' },
    { id: 'pricing', name: 'Validate Pricing', icon: '💰', description: 'Find the right price point' },
    { id: 'feature', name: 'Validate Feature', icon: '✨', description: 'Test feature desirability' },
    { id: 'general', name: 'General Idea Feedback', icon: '💡', description: 'Get overall feedback' }
  ];

  const audienceTypes = [
    { id: 'student', name: 'Student', icon: '🎓' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'business', name: 'Business Owner', icon: '🏢' },
    { id: 'other', name: 'Other', icon: '👥' }
  ];

  const questionTemplates = {
    problem: [
      { id: 1, text: 'Have you experienced this problem?', type: 'yesno', editable: true },
      { id: 2, text: 'How often do you face this issue?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'], editable: true },
      { id: 3, text: 'How do you currently solve this?', type: 'text', editable: true },
      { id: 4, text: 'How painful is this problem? (1-10)', type: 'rating', editable: true }
    ],
    pricing: [
      { id: 1, text: 'Would you pay for this solution?', type: 'yesno', editable: true },
      { id: 2, text: 'What price feels reasonable?', type: 'select', options: ['₹0-500', '₹500-1000', '₹1000-2000', '₹2000+'], editable: true },
      { id: 3, text: 'Why?', type: 'text', editable: true },
      { id: 4, text: 'What features justify this price?', type: 'text', editable: true }
    ],
    feature: [
      { id: 1, text: 'Would you use this feature?', type: 'yesno', editable: true },
      { id: 2, text: 'How important is this feature to you?', type: 'rating', editable: true },
      { id: 3, text: 'What would make it better?', type: 'text', editable: true },
      { id: 4, text: 'Would this solve your problem?', type: 'yesno', editable: true }
    ],
    general: [
      { id: 1, text: 'What do you think about this idea?', type: 'text', editable: true },
      { id: 2, text: 'Would you use this product?', type: 'yesno', editable: true },
      { id: 3, text: 'What concerns do you have?', type: 'text', editable: true },
      { id: 4, text: 'Any suggestions?', type: 'text', editable: true }
    ]
  };

  const handlePurposeSelect = (purposeId) => {
    setFormData({
      ...formData,
      purpose: purposeId,
      questions: questionTemplates[purposeId] || []
    });
    setStep(2);
  };

  const handleQuestionEdit = (id, newText) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => q.id === id ? { ...q, text: newText } : q)
    });
  };

  const handleQuestionRemove = (id) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id)
    });
  };

  const handleAddQuestion = () => {
    const newId = Math.max(...formData.questions.map(q => q.id), 0) + 1;
    setFormData({
      ...formData,
      questions: [...formData.questions, { id: newId, text: '', type: 'text', editable: true }]
    });
  };

  const handleGenerateLink = async () => {
    if (!startupId) {
      alert('Startup not found. Please complete your profile first.');
      return;
    }

    setCreating(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/feedback-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${formData.purpose} Validation Form`,
          purpose: formData.purpose,
          questions: formData.questions,
          targetAudience: formData.targetAudience ? [formData.targetAudience] : [],
          contextNote: formData.contextNote
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create feedback form');
      }

      const result = await response.json();
      if (result.publicUrl) {
        setGeneratedLink(result.publicUrl);
        setStep(4);
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Failed to create feedback form. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard!');
  };

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setFormData({ purpose: '', questions: [], targetAudience: '', contextNote: '' });
    setGeneratedLink('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Feedback & Validation</h1>
            <p className="mt-1 text-sm text-gray-300">Collect and analyze feedback from stakeholders</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg transition hover:opacity-90" 
            style={{ backgroundColor: 'var(--neon-blue)', color: 'white' }}
          >
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Feedback Form</h2>
                  <p className="text-sm text-gray-400 mt-1">Step {step} of 4</p>
                </div>
                <button onClick={resetModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Step 1: Choose Purpose */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Choose Your Validation Purpose</h3>
                      <p className="text-gray-400 text-sm">What do you want to validate with this feedback form?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purposes.map((purpose) => (
                        <button
                          key={purpose.id}
                          onClick={() => handlePurposeSelect(purpose.id)}
                          className="glass-card p-6 text-left hover:border-[var(--neon-blue)] transition group"
                        >
                          <div className="text-4xl mb-3">{purpose.icon}</div>
                          <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--neon-blue)]">
                            {purpose.name}
                          </h4>
                          <p className="text-sm text-gray-400">{purpose.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Customize Questions */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Customize Your Questions</h3>
                      <p className="text-gray-400 text-sm">Edit, remove, or add questions to your feedback form</p>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.questions.map((question, index) => (
                        <div key={question.id} className="glass-card p-4">
                          <div className="flex items-start gap-4">
                            <span className="text-[var(--neon-blue)] font-bold mt-2">Q{index + 1}</span>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={question.text}
                                onChange={(e) => handleQuestionEdit(question.id, e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--neon-blue)]"
                                placeholder="Enter your question"
                              />
                              <span className="text-xs text-gray-500 mt-1 block">Type: {question.type}</span>
                            </div>
                            <button
                              onClick={() => handleQuestionRemove(question.id)}
                              className="text-red-400 hover:text-red-300 mt-2"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAddQuestion}
                      className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-[var(--neon-blue)] transition"
                    >
                      + Add Custom Question
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 px-6 py-2 rounded-lg transition"
                        style={{ backgroundColor: 'var(--neon-blue)', color: 'white' }}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Target Audience */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Define Your Target Audience</h3>
                      <p className="text-gray-400 text-sm">Who is this feedback form for?</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {audienceTypes.map((audience) => (
                        <button
                          key={audience.id}
                          onClick={() => setFormData({ ...formData, targetAudience: audience.id })}
                          className={`glass-card p-4 text-center transition ${
                            formData.targetAudience === audience.id
                              ? 'border-[var(--neon-blue)] bg-blue-500/10'
                              : 'hover:border-white/30'
                          }`}
                        >
                          <div className="text-3xl mb-2">{audience.icon}</div>
                          <p className="text-sm text-white">{audience.name}</p>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Context Note (Optional)
                      </label>
                      <textarea
                        value={formData.contextNote}
                        onChange={(e) => setFormData({ ...formData, contextNote: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--neon-blue)] resize-none"
                        rows="3"
                        placeholder="e.g., This app is for hostel students ordering food..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleGenerateLink}
                        disabled={creating}
                        className="flex-1 px-6 py-2 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--neon-green)', color: 'white' }}
                      >
                        {creating ? 'Creating...' : 'Generate Form Link 🚀'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Share Form */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-white mb-2">Your Form is Ready!</h3>
                      <p className="text-gray-400">Share this link to start collecting feedback</p>
                    </div>

                    {/* Generated Link */}
                    <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Public Form Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-6 py-3 rounded-lg transition font-semibold"
                          style={{ backgroundColor: 'var(--neon-blue)', color: 'white' }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>

                    {/* Sharing Options */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Share Options</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="glass-card p-4 flex items-center gap-3 hover:border-green-500 transition">
                          <span className="text-2xl">💬</span>
                          <span className="text-white font-medium">WhatsApp</span>
                        </button>
                        <button className="glass-card p-4 flex items-center gap-3 hover:border-blue-500 transition">
                          <span className="text-2xl">✉️</span>
                          <span className="text-white font-medium">Email</span>
                        </button>
                        <button className="glass-card p-4 flex items-center gap-3 hover:border-purple-500 transition">
                          <span className="text-2xl">📱</span>
                          <span className="text-white font-medium">QR Code</span>
                        </button>
                        <button className="glass-card p-4 flex items-center gap-3 hover:border-cyan-500 transition">
                          <span className="text-2xl">🔗</span>
                          <span className="text-white font-medium">Embed</span>
                        </button>
                      </div>
                    </div>

                    {/* Smart Suggestion */}
                    {formData.targetAudience && (
                      <div className="glass-card p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                        <div className="flex gap-3">
                          <span className="text-2xl">💡</span>
                          <div>
                            <h5 className="font-semibold text-white mb-1">Smart Suggestion</h5>
                            <p className="text-sm text-gray-300">
                              {formData.targetAudience === 'student' && "Share this in college WhatsApp or Telegram groups to reach students."}
                              {formData.targetAudience === 'professional' && "Share on LinkedIn to reach professionals in your network."}
                              {formData.targetAudience === 'business' && "Share in entrepreneur communities and business forums."}
                              {formData.targetAudience === 'other' && "Share in relevant online communities where your audience hangs out."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={resetModal}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
                    >
                      Done ✓
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
