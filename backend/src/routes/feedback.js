const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get feedback for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }
    
    const feedbackSnapshot = await db.collection('feedbackResponses')
      .where('startupId', '==', startupId)
      .orderBy('submittedAt', 'desc')
      .limit(50)
      .get();

    const feedback = [];
    feedbackSnapshot.forEach(doc => {
      feedback.push({ id: doc.id, ...doc.data() });
    });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Create feedback form
router.post('/forms', authMiddleware, async (req, res) => {
  try {
    const { startupId, uid } = req.user;
    const { title, questions, targetAudience } = req.body;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }
    
    const formData = {
      title,
      questions,
      targetAudience,
      startupId,
      shareableLink: `${process.env.FRONTEND_URL}/feedback/form/${Date.now()}`,
      createdBy: uid,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('feedbackForms').add(formData);
    
    res.status(201).json({ id: docRef.id, ...formData });
  } catch (error) {
    console.error('Create feedback form error:', error);
    res.status(500).json({ error: 'Failed to create feedback form' });
  }
});

// Submit feedback response
router.post('/responses', async (req, res) => {
  try {
    const { formId, responses, respondentEmail, sentiment } = req.body;
    
    const responseData = {
      formId,
      responses,
      respondentEmail,
      sentiment: sentiment || 'neutral',
      submittedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('feedbackResponses').add(responseData);
    
    res.status(201).json({ id: docRef.id, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
