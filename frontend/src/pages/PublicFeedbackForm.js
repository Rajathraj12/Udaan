import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../components/Logo';

export default function PublicFeedbackForm() {
  const { slug, formId } = useParams();
  const identifier = formId || slug; // Support both /f/:slug and /feedback/:formId
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFormData();
  }, [identifier]);

  const fetchFormData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback-forms/public/${identifier}`);
      if (!response.ok) {
        throw new Error('Form not found');
      }
      const result = await response.json();
      setFormData(result.form);
      
      // Initialize answers object
      const initialAnswers = {};
      result.form.questions.forEach((q, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({
      ...answers,
      [questionIndex]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formattedAnswers = formData.questions.map((question, index) => ({
        questionId: question.id || index,
        questionText: question.text,
        answer: answers[index]
      }));

      const response = await fetch(`http://localhost:5000/api/feedback-forms/public/${identifier}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses: formattedAnswers,
          userType,
          email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <Logo className="h-16 w-auto mx-auto drop-shadow-2xl" />
          </div>
          <div className="animate-pulse">
            <div className="h-2 w-48 bg-blue-500/30 rounded-full mx-auto"></div>
            <p className="text-white text-xl mt-4">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Logo className="h-16 w-auto mx-auto drop-shadow-2xl" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-white mb-2">Form Not Found</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Logo className="h-16 w-auto mx-auto drop-shadow-2xl" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-gray-300 text-lg mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve!
            </p>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                Your response is valuable and will help shape the future of this product.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'yesno':
        return (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswerChange(index, 'Yes')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                answers[index] === 'Yes'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:border-green-500/30'
              }`}
            >
              👍 Yes
            </button>
            <button
              type="button"
              onClick={() => handleAnswerChange(index, 'No')}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                answers[index] === 'No'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20 hover:border-red-500/30'
              }`}
            >
              👎 No
            </button>
          </div>
        );

      case 'rating':
        return (
          <div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={answers[index] || 5}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="w-full h-3 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(239 68 68 / 0.3) 0%, 
                    rgb(234 179 8 / 0.3) 50%, 
                    rgb(34 197 94 / 0.3) 100%)`
                }}
              />
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400 mt-3">
              <span className="text-xs">Poor</span>
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full">
                <span className="text-white font-bold text-xl">{answers[index] || 5}</span>
                <span className="text-blue-300 text-xs">/ 10</span>
              </div>
              <span className="text-xs">Excellent</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'text':
      default:
        return (
          <textarea
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition placeholder-gray-500"
            rows="4"
            placeholder="Type your answer here..."
          />
        );
    }
  };

  const getPurposeIcon = (purpose) => {
    const icons = {
      problem: '🎯',
      pricing: '💰',
      feature: '✨',
      general: '💡'
    };
    return icons[formData.purpose] || '📝';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
              <Logo className="h-14 w-auto" />
            </div>
          </div>
          <div className="inline-block bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full px-6 py-2 mb-4">
            <span className="text-4xl mr-2">{getPurposeIcon()}</span>
            <span className="text-blue-300 font-semibold text-sm uppercase tracking-wider">
              {formData.purpose.charAt(0).toUpperCase() + formData.purpose.slice(1)} Validation
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {formData.title}
          </h1>
          {formData.contextNote && (
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-3 leading-relaxed">{formData.contextNote}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm">Takes ~2 minutes • Anonymous & Secure</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Questions */}
          {formData.questions.map((question, index) => (
            <div key={question.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <label className="block">
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 font-bold rounded-full text-sm border border-blue-500/30">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-white font-medium text-lg">{question.text}</span>
                    <span className="text-red-400 ml-1">*</span>
                  </div>
                </div>
                {renderQuestion(question, index)}
              </label>
            </div>
          ))}

          {/* Optional Fields */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">👤</span>
              About You (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">I am a:</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                >
                  <option value="">Select type (optional)</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="business">Business Owner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Email (if you'd like updates):</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transform"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Feedback 🚀'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Powered by Udaan • Secure & Anonymous
          </div>
        </div>
      </div>
    </div>
  );
}
