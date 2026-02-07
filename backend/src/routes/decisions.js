const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all decisions for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const decisionsSnapshot = await db.collection('decisions')
      .where('startupId', '==', startupId)
      .get();

    const decisions = decisionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      // Sort by createdAt descending (client-side)
      const aTime = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const bTime = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    res.json(decisions);

  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

// Create a new decision
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startupId, uid } = req.user;
    const { title, context, options, chosenOption, reasoning, dataSupport, expectedOutcome, category } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    if (!title || !chosenOption || !reasoning) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const decisionData = {
      startupId,
      createdBy: uid,
      title,
      context: context || '',
      options: options || [], // Array of alternative options considered
      chosenOption,
      reasoning,
      dataSupport: dataSupport || '', // What data/evidence supported this decision
      expectedOutcome: expectedOutcome || '',
      actualOutcome: '', // To be filled later
      category: category || 'strategic', // strategic, product, hiring, fundraising, marketing
      status: 'active', // active, validated, invalidated
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewDate: null, // When to review this decision
    };

    const docRef = await db.collection('decisions').add(decisionData);

    res.status(201).json({
      id: docRef.id,
      ...decisionData,
    });

  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

// Update decision outcome
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { id } = req.params;
    const { actualOutcome, status, reviewDate } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const decisionDoc = await db.collection('decisions').doc(id).get();

    if (!decisionDoc.exists) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    if (decisionDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (actualOutcome !== undefined) updateData.actualOutcome = actualOutcome;
    if (status !== undefined) updateData.status = status;
    if (reviewDate !== undefined) updateData.reviewDate = reviewDate;

    await db.collection('decisions').doc(id).update(updateData);

    res.json({
      id,
      ...decisionDoc.data(),
      ...updateData,
    });

  } catch (error) {
    console.error('Error updating decision:', error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

// Delete a decision
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { id } = req.params;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const decisionDoc = await db.collection('decisions').doc(id).get();

    if (!decisionDoc.exists) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    if (decisionDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('decisions').doc(id).delete();

    res.json({ success: true, message: 'Decision deleted' });

  } catch (error) {
    console.error('Error deleting decision:', error);
    res.status(500).json({ error: 'Failed to delete decision' });
  }
});

module.exports = router;
