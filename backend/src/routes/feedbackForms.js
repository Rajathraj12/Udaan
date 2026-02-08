const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authenticate = require('../middleware/auth');

// Create a new feedback form (Founder only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { uid, role } = req.user;
    
    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can create feedback forms' });
    }

    const {
      title,
      purpose,
      questions,
      targetAudience,
      contextNote,
      linkedAssumption
    } = req.body;

    // Generate unique public ID
    const publicId = Math.random().toString(36).substr(2, 9);

    const formData = {
      founderId: uid,
      title,
      purpose,
      questions,
      targetAudience: targetAudience || [],
      contextNote: contextNote || '',
      linkedAssumption: linkedAssumption || null,
      publicId,
      publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback/${publicId}`,
      responseCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('feedbackForms').add(formData);

    res.json({
      success: true,
      formId: docRef.id,
      publicId,
      publicUrl: formData.publicUrl,
      form: { id: docRef.id, ...formData }
    });
  } catch (error) {
    console.error('Error creating feedback form:', error);
    res.status(500).json({ error: 'Failed to create feedback form' });
  }
});

// Get all feedback forms for a founder
router.get('/', authenticate, async (req, res) => {
  try {
    const { uid, role } = req.user;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can view feedback forms' });
    }

    const snapshot = await db.collection('feedbackForms')
      .where('founderId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const forms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching feedback forms:', error);
    res.status(500).json({ error: 'Failed to fetch feedback forms' });
  }
});

// Get a specific feedback form (Founder only - with responses)
router.get('/:formId', authenticate, async (req, res) => {
  try {
    const { uid, role } = req.user;
    const { formId } = req.params;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can view feedback forms' });
    }

    const formDoc = await db.collection('feedbackForms').doc(formId).get();

    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const formData = formDoc.data();

    if (formData.founderId !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get responses
    const responsesSnapshot = await db.collection('feedbackResponses')
      .where('formId', '==', formId)
      .orderBy('submittedAt', 'desc')
      .get();

    const responses = responsesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      form: { id: formDoc.id, ...formData },
      responses
    });
  } catch (error) {
    console.error('Error fetching feedback form:', error);
    res.status(500).json({ error: 'Failed to fetch feedback form' });
  }
});

// PUBLIC ROUTE - Get form by public ID (NO AUTH required)
router.get('/public/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    const snapshot = await db.collection('feedbackForms')
      .where('publicId', '==', publicId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    const formDoc = snapshot.docs[0];
    const formData = formDoc.data();

    // Return only necessary public data
    res.json({
      success: true,
      form: {
        id: formDoc.id,
        title: formData.title,
        purpose: formData.purpose,
        questions: formData.questions,
        contextNote: formData.contextNote,
        targetAudience: formData.targetAudience
      }
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// PUBLIC ROUTE - Submit feedback response (NO AUTH required)
router.post('/public/:publicId/submit', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { responses, userType, email, additionalNotes } = req.body;

    // Get the form
    const snapshot = await db.collection('feedbackForms')
      .where('publicId', '==', publicId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    const formDoc = snapshot.docs[0];
    const formData = formDoc.data();

    // Create response
    const responseData = {
      formId: formDoc.id,
      founderId: formData.founderId,
      linkedAssumption: formData.linkedAssumption,
      responses,
      userType: userType || 'anonymous',
      email: email || null,
      additionalNotes: additionalNotes || '',
      submittedAt: new Date().toISOString(),
      ipAddress: req.ip || 'unknown'
    };

    await db.collection('feedbackResponses').add(responseData);

    // Update response count
    await formDoc.ref.update({
      responseCount: (formData.responseCount || 0) + 1,
      updatedAt: new Date().toISOString()
    });

    // Update linked assumption if exists
    if (formData.linkedAssumption) {
      await updateAssumptionFromFeedback(formData.linkedAssumption, responses, formData.founderId);
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Helper function to update assumption based on feedback
async function updateAssumptionFromFeedback(assumptionId, responses, founderId) {
  try {
    const assumptionDoc = await db.collection('assumptions').doc(assumptionId).get();
    
    if (!assumptionDoc.exists) return;

    const assumptionData = assumptionDoc.data();
    
    // Analyze responses for validation
    let validationScore = 0;
    let totalQuestions = 0;

    responses.forEach(response => {
      totalQuestions++;
      if (response.answer) {
        // Simple scoring logic
        if (typeof response.answer === 'boolean') {
          validationScore += response.answer ? 1 : 0;
        } else if (typeof response.answer === 'string') {
          const positive = ['yes', 'definitely', 'absolutely', 'great', 'good', 'love'];
          const lowerAnswer = response.answer.toLowerCase();
          if (positive.some(word => lowerAnswer.includes(word))) {
            validationScore += 1;
          }
        }
      }
    });

    const validationPercentage = totalQuestions > 0 ? (validationScore / totalQuestions) * 100 : 0;

    // Update assumption status based on validation
    let newStatus = assumptionData.status;
    if (validationPercentage >= 70) {
      newStatus = 'validated';
    } else if (validationPercentage >= 40) {
      newStatus = 'testing';
    } else if (validationPercentage < 40 && (assumptionData.responseCount || 0) >= 5) {
      newStatus = 'invalidated';
    }

    await assumptionDoc.ref.update({
      status: newStatus,
      responseCount: (assumptionData.responseCount || 0) + 1,
      validationScore: validationPercentage,
      lastValidated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating assumption:', error);
  }
}

// Delete a feedback form
router.delete('/:formId', authenticate, async (req, res) => {
  try {
    const { uid, role } = req.user;
    const { formId } = req.params;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can delete feedback forms' });
    }

    const formDoc = await db.collection('feedbackForms').doc(formId).get();

    if (!formDoc.exists) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (formDoc.data().founderId !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Soft delete - just mark as inactive
    await formDoc.ref.update({
      status: 'inactive',
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

module.exports = router;
