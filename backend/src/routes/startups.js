const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get my startup
router.get('/my-startup', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    
    if (!startupId) {
      return res.status(404).json({ error: 'No startup associated with user' });
    }

    const startupDoc = await db.collection('startups').doc(startupId).get();
    
    if (!startupDoc.exists) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    res.json({ id: startupDoc.id, ...startupDoc.data() });
  } catch (error) {
    console.error('Get my startup error:', error);
    res.status(500).json({ error: 'Failed to fetch startup' });
  }
});

// Get startup profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const startupDoc = await db.collection('startups').doc(id).get();
    
    if (!startupDoc.exists) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    res.json({ id: startupDoc.id, ...startupDoc.data() });
  } catch (error) {
    console.error('Get startup error:', error);
    res.status(500).json({ error: 'Failed to fetch startup' });
  }
});

// Create startup profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, industry, stage, foundedDate, teamSize } = req.body;
    
    const startupData = {
      name,
      description,
      industry,
      stage,
      foundedDate,
      teamSize,
      goals: [],
      teamMembers: [{
        userId: req.user.uid,
        role: 'founder',
        joinedAt: new Date().toISOString(),
      }],
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('startups').add(startupData);
    
    // Update user with startupId
    await db.collection('users').doc(req.user.uid).update({
      startupId: docRef.id,
    });
    
    res.status(201).json({ id: docRef.id, ...startupData });
  } catch (error) {
    console.error('Create startup error:', error);
    res.status(500).json({ error: 'Failed to create startup' });
  }
});

// Update startup profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('startups').doc(id).update(updateData);
    
    res.json({ message: 'Startup updated successfully' });
  } catch (error) {
    console.error('Update startup error:', error);
    res.status(500).json({ error: 'Failed to update startup' });
  }
});

// Get team members for a startup
router.get('/:id/team', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startupId } = req.user;

    console.log('Fetching team for startup:', id, 'User startupId:', startupId);

    // Verify user has access to this startup
    if (startupId !== id) {
      console.log('Unauthorized: User startupId does not match requested id');
      return res.status(403).json({ error: 'Unauthorized access to startup team' });
    }

    const usersSnapshot = await db.collection('users')
      .where('startupId', '==', id)
      .get();

    const teamMembers = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    console.log('Found team members:', teamMembers.length);
    res.json(teamMembers);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

module.exports = router;
