const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// PUBLIC ROUTE - Get feedback form by ID (no auth required)
router.get('/forms/public/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    
    const formDoc = await db.collection('feedbackForms').doc(formId).get();
    
    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const formData = formDoc.data();
    
    // Return public-facing data only
    res.json({
      id: formDoc.id,
      title: formData.title,
      purpose: formData.purpose,
      questions: formData.questions,
      targetAudience: formData.targetAudience,
      contextNote: formData.contextNote,
      startupName: formData.startupName || 'Startup',
    });
  } catch (error) {
    console.error('Get public feedback form error:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// PUBLIC ROUTE - Submit feedback response (no auth required)
router.post('/forms/public/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers, userType, email } = req.body;
    
    // Get the form to link to startup
    const formDoc = await db.collection('feedbackForms').doc(formId).get();
    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const formData = formDoc.data();
    
    const responseData = {
      formId,
      startupId: formData.startupId,
      assumptionId: formData.assumptionId || null,
      answers,
      userType: userType || 'Anonymous',
      email: email || null,
      submittedAt: new Date().toISOString(),
      purpose: formData.purpose,
    };

    const docRef = await db.collection('feedbackResponses').add(responseData);
    
    // Update assumption validation count if linked
    if (formData.assumptionId) {
      const assumptionRef = db.collection('assumptions').doc(formData.assumptionId);
      const assumptionDoc = await assumptionRef.get();
      
      if (assumptionDoc.exists) {
        const currentCount = assumptionDoc.data().validationCount || 0;
        await assumptionRef.update({
          validationCount: currentCount + 1,
          lastValidated: new Date().toISOString(),
        });
      }
    }
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Thank you for your feedback!' 
    });
  } catch (error) {
    console.error('Submit public feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }
    
    const feedbackSnapshot = await db.collection('feedbackResponses')
      .where('startupId', '==', startupId)
      .limit(50)
      .get();

    const feedback = feedbackSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        // Sort by submittedAt in descending order (newest first)
        const dateA = new Date(a.submittedAt || 0);
        const dateB = new Date(b.submittedAt || 0);
        return dateB - dateA;
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
    const { title, purpose, questions, targetAudience, assumptionId, contextNote } = req.body;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }
    
    // Get startup name
    const startupDoc = await db.collection('startups').doc(startupId).get();
    const startupName = startupDoc.exists ? startupDoc.data().name : 'Startup';
    
    const formData = {
      title,
      purpose: purpose || 'General Idea Feedback',
      questions,
      targetAudience: targetAudience || 'General',
      assumptionId: assumptionId || null,
      contextNote: contextNote || '',
      startupId,
      startupName,
      createdBy: uid,
      createdAt: new Date().toISOString(),
      responseCount: 0,
    };

    const docRef = await db.collection('feedbackForms').add(formData);
    
    // Update with the actual shareable link using the document ID
    const shareableLink = `http://localhost:3000/feedback/${docRef.id}`;
    await docRef.update({ shareableLink });
    
    res.status(201).json({ 
      id: docRef.id, 
      ...formData,
      shareableLink 
    });
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
