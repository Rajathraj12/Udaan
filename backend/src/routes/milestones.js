const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get all milestones for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const startupId = req.user.startupId;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with this user' });
    }
    
    const milestonesSnapshot = await db.collection('milestones')
      .where('startupId', '==', startupId)
      .get();

    const milestones = [];
    milestonesSnapshot.forEach(doc => {
      milestones.push({ id: doc.id, ...doc.data() });
    });

    res.json({ milestones });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Create a new milestone
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, targetDate, description } = req.body;
    const startupId = req.user.startupId;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with this user' });
    }
    
    const milestoneData = {
      title,
      targetDate,
      description,
      status: 'not-started',
      progress: 0,
      linkedTasks: [],
      startupId,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('milestones').add(milestoneData);
    
    res.status(201).json({ id: docRef.id, ...milestoneData });
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Update a milestone
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('milestones').doc(id).update(updateData);
    
    res.json({ message: 'Milestone updated successfully' });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

module.exports = router;
