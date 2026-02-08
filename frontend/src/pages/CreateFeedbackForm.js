import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const purposeTemplates = {
  'problem-validation': {
    label: 'Validate Problem',
    icon: '🎯',
    defaultQuestions: [
      { id: 1, type: 'radio', question: 'Have you experienced this problem?', options: ['Yes, frequently', 'Yes, sometimes', 'Rarely', 'Never'], required: true },
      { id: 2, type: 'radio', question: 'How painful is this problem for you?', options: ['Very painful', 'Somewhat painful', 'Slightly painful', 'Not painful'], required: true },
      { id: 3, type: 'text', question: 'How do you currently solve this problem?', required: false },
      { id: 4, type: 'radio', question: 'Would you pay for a solution?', options: ['Definitely yes', 'Probably yes', 'Maybe', 'No'], required: true }
    ]
  },
  'pricing-validation': {
    label: 'Validate Pricing',
    icon: '💰',
    defaultQuestions: [
      { id: 1, type: 'radio', question: 'Would you pay for this solution?', options: ['Yes', 'No', 'Maybe'], required: true },
      { id: 2, type: 'select', question: 'What price feels reasonable?', options: ['₹0-99', '₹100-299', '₹300-499', '₹500-999', '₹1000+'], required: true },
      { id: 3, type: 'text', question: 'Why did you choose this price range?', required: false },
      { id: 4, type: 'radio', question: 'Would you prefer a subscription or one-time payment?', options: ['Monthly subscription', 'One-time payment', 'Pay per use', 'Freemium'], required: true }
    ]
  },
  'feature-validation': {
    label: 'Validate Feature',
    icon: '✨',
    defaultQuestions: [
      { id: 1, type: 'radio', question: 'How useful would this feature be for you?', options: ['Very useful', 'Somewhat useful', 'Slightly useful', 'Not useful'], required: true },
      { id: 2, type: 'radio', question: 'How often would you use this feature?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'], required: true },
      { id: 3, type: 'text', question: 'What would make this feature more valuable?', required: false },
      { id: 4, type: 'radio', question: 'Would this feature influence your decision to use our product?', options: ['Definitely', 'Probably', 'Maybe', 'No'], required: true }
    ]
  },
  'general-feedback': {
    label: 'General Idea Feedback',
    icon: '💡',
    defaultQuestions: [
      { id: 1, type: 'radio', question: 'What do you think of this idea?', options: ['Love it', 'Like it', 'Neutral', 'Don\'t like it'], required: true },
      { id: 2, type: 'text', question: 'What excites you about this idea?', required: false },
      { id: 3, type: 'text', question: 'What concerns do you have?', required: false },
      { id: 4, type: 'radio', question: 'Would you recommend this to a friend?', options: ['Definitely', 'Probably', 'Maybe', 'No'], required: true }
    ]
  }
};

const targetAudienceOptions = [
  { value: 'students', label: 'Students', icon: '🎓' },
  { value: 'professionals', label: 'Professionals', icon: '💼' },
  { value: 'business', label: 'Business Owners', icon: '🏢' },
  { value: 'general', label: 'General Public', icon: '👥' }
];

export default function CreateFeedbackForm() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assumptions, setAssumptions] = useState([]);
  const [createdForm, setCreatedForm] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    questions: [],
    targetAudience: [],
    contextNote: '',
    linkedAssumption: null
  });

  useEffect(() => {
    fetchAssumptions();
  }, []);

  const fetchAssumptions = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/assumptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAssumptions(data.assumptions);
      }
    } catch (error) {
      console.error('Error fetching assumptions:', error);
    }
  };

  const selectPurpose = (purpose) => {
    const template = purposeTemplates[purpose];
    setFormData({
      ...formData,
      purpose,
      questions: template.defaultQuestions.map(q => ({ ...q }))
    });
    setStep(2);
  };

  const updateQuestion = (id, field, value) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const addQuestion = () => {
    const newId = Math.max(...formData.questions.map(q => q.id), 0) + 1;
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { id: newId, type: 'text', question: '', required: true }
      ]
    });
  };

  const removeQuestion = (id) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id)
    });
  };

  const toggleAudience = (value) => {
    setFormData({
      ...formData,
      targetAudience: formData.targetAudience.includes(value)
        ? formData.targetAudience.filter(a => a !== value)
        : [...formData.targetAudience, value]
    });
  };

  const createForm = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/feedback-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setCreatedForm(data);
        setStep(4);
      } else {
        alert('Failed to create form');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Error creating form');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdForm.publicUrl);
    alert('Link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `Hey! Please help me validate my startup idea by filling this quick feedback form: ${createdForm.publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (createdForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Form Created Successfully!</h2>
            <p className="text-gray-300 mb-8">Your feedback form is now live and ready to be shared</p>

            <div className="bg-black/30 rounded-xl p-6 mb-8">
              <p className="text-gray-400 text-sm mb-2">Public Form URL</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={createdForm.publicUrl}
                  readOnly
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
                <button
                  onClick={copyLink}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium"
              >
                <span>📱</span> Share on WhatsApp
              </button>
              <button
                onClick={() => window.open(createdForm.publicUrl, '_blank')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium"
              >
                <span>👁️</span> Preview Form
              </button>
            </div>

            {formData.targetAudience.includes('students') && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Pro Tip:</strong> Since your audience is students, share this in college WhatsApp groups, Telegram channels, and campus social media pages.
                </p>
              </div>
            )}

            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Purpose', 'Questions', 'Audience', 'Create'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > idx ? 'bg-blue-600 text-white' : step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && <div className={`w-16 h-1 mx-2 ${step > idx + 1 ? 'bg-blue-600' : 'bg-white/10'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Choose Purpose */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">What do you want to validate?</h2>
            <p className="text-gray-400 mb-8">Choose your purpose to get started with recommended questions</p>

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(purposeTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => selectPurpose(key)}
                  className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition group"
                >
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400">{template.label}</h3>
                  <p className="text-gray-400 text-sm">{template.defaultQuestions.length} recommended questions</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customize Questions */}
        {step === 2 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Customize Your Questions</h2>
            <p className="text-gray-400 mb-6">Edit, remove, or add questions</p>

            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Form Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Hostel Food Delivery - Pricing Validation"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-4 mb-6">
              {formData.questions.map((q, idx) => (
                <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                        className="w-full bg-transparent text-white text-lg mb-3 border-b border-white/10 pb-2 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your question"
                      />
                      <div className="flex gap-4 items-center">
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="text">Text Answer</option>
                          <option value="radio">Multiple Choice</option>
                          <option value="select">Dropdown</option>
                        </select>
                        <label className="flex items-center gap-2 text-gray-400 text-sm">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                            className="rounded"
                          />
                          Required
                        </label>
                        {formData.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="ml-auto text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-white mb-6"
            >
              + Add Custom Question
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Target Audience */}
        {step === 3 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Who is your target audience?</h2>
            <p className="text-gray-400 mb-6">Select one or more audience types</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {targetAudienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleAudience(option.value)}
                  className={`p-6 rounded-xl border-2 transition ${
                    formData.targetAudience.includes(option.value)
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <div className="text-white font-medium">{option.label}</div>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Context Note (Optional)</label>
              <textarea
                value={formData.contextNote}
                onChange={(e) => setFormData({ ...formData, contextNote: e.target.value })}
                placeholder="e.g., This app is for hostel students ordering food..."
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Link to Assumption (Optional)</label>
              <select
                value={formData.linkedAssumption || ''}
                onChange={(e) => setFormData({ ...formData, linkedAssumption: e.target.value || null })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
              >
                <option value="">No assumption linked</option>
                {assumptions.map((assumption) => (
                  <option key={assumption.id} value={assumption.id}>
                    {assumption.title}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 text-sm mt-2">Responses will automatically update the linked assumption's validation status</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white"
              >
                ← Back
              </button>
              <button
                onClick={createForm}
                disabled={loading || formData.targetAudience.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '✨ Create Form'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
