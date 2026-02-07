const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all assumptions for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const assumptionsSnapshot = await db.collection('assumptions')
      .where('startupId', '==', startupId)
      .orderBy('createdAt', 'desc')
      .get();

    const assumptions = assumptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(assumptions);

  } catch (error) {
    console.error('Error fetching assumptions:', error);
    res.status(500).json({ error: 'Failed to fetch assumptions' });
  }
});

// Create a new assumption
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startupId, uid } = req.user;
    const { hypothesis, category, priority, testMethod } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    if (!hypothesis) {
      return res.status(400).json({ error: 'Hypothesis is required' });
    }

    const assumptionData = {
      startupId,
      createdBy: uid,
      hypothesis,
      category: category || 'customer', // customer, problem, solution, market, business model
      priority: priority || 'medium', // high, medium, low
      status: 'untested', // untested, testing, validated, invalidated
      testMethod: testMethod || '',
      evidence: [], // Array of linked feedback/data
      validationScore: 0, // 0-100 based on supporting evidence
      linkedFeedback: [], // Array of feedback IDs
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('assumptions').add(assumptionData);

    res.status(201).json({
      id: docRef.id,
      ...assumptionData,
    });

  } catch (error) {
    console.error('Error creating assumption:', error);
    res.status(500).json({ error: 'Failed to create assumption' });
  }
});

// Link feedback to assumption
router.post('/:id/link-feedback', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { id } = req.params;
    const { feedbackId, supportsHypothesis } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const assumptionDoc = await db.collection('assumptions').doc(id).get();

    if (!assumptionDoc.exists) {
      return res.status(404).json({ error: 'Assumption not found' });
    }

    if (assumptionDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const assumption = assumptionDoc.data();
    const linkedFeedback = assumption.linkedFeedback || [];
    const evidence = assumption.evidence || [];

    // Add feedback link
    if (!linkedFeedback.includes(feedbackId)) {
      linkedFeedback.push(feedbackId);
    }

    // Add evidence entry
    evidence.push({
      feedbackId,
      supportsHypothesis,
      addedAt: new Date().toISOString(),
    });

    // Recalculate validation score
    const supportingEvidence = evidence.filter(e => e.supportsHypothesis).length;
    const totalEvidence = evidence.length;
    const validationScore = totalEvidence > 0 ? Math.round((supportingEvidence / totalEvidence) * 100) : 0;

    // Auto-update status based on validation score
    let status = assumption.status;
    if (totalEvidence >= 5) {
      if (validationScore >= 70) status = 'validated';
      else if (validationScore <= 30) status = 'invalidated';
      else status = 'testing';
    } else if (totalEvidence > 0) {
      status = 'testing';
    }

    await db.collection('assumptions').doc(id).update({
      linkedFeedback,
      evidence,
      validationScore,
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      id,
      linkedFeedback,
      validationScore,
      status,
    });

  } catch (error) {
    console.error('Error linking feedback:', error);
    res.status(500).json({ error: 'Failed to link feedback' });
  }
});

// Update assumption
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { id } = req.params;
    const { hypothesis, category, priority, status, testMethod } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const assumptionDoc = await db.collection('assumptions').doc(id).get();

    if (!assumptionDoc.exists) {
      return res.status(404).json({ error: 'Assumption not found' });
    }

    if (assumptionDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (hypothesis !== undefined) updateData.hypothesis = hypothesis;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (testMethod !== undefined) updateData.testMethod = testMethod;

    await db.collection('assumptions').doc(id).update(updateData);

    res.json({
      id,
      ...assumptionDoc.data(),
      ...updateData,
    });

  } catch (error) {
    console.error('Error updating assumption:', error);
    res.status(500).json({ error: 'Failed to update assumption' });
  }
});

// Delete assumption
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { id } = req.params;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const assumptionDoc = await db.collection('assumptions').doc(id).get();

    if (!assumptionDoc.exists) {
      return res.status(404).json({ error: 'Assumption not found' });
    }

    if (assumptionDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('assumptions').doc(id).delete();

    res.json({ success: true, message: 'Assumption deleted' });

  } catch (error) {
    console.error('Error deleting assumption:', error);
    res.status(500).json({ error: 'Failed to delete assumption' });
  }
});

module.exports = router;
