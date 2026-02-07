const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const admin = require('firebase-admin');
const db = admin.firestore();

// Stage definitions with unlock criteria
const STAGES = {
  idea: {
    name: 'Idea Stage',
    order: 1,
    unlockCriteria: [
      { id: 'startup_profile', label: 'Startup profile completed', type: 'startup' },
      { id: 'problem_defined', label: 'Problem clearly defined', type: 'manual' },
    ],
    nextStage: 'mvp',
  },
  mvp: {
    name: 'MVP Stage',
    order: 2,
    unlockCriteria: [
      { id: 'tasks_completed', label: 'At least 10 tasks completed', type: 'tasks', threshold: 10 },
      { id: 'customer_feedback', label: 'At least 5 customer interviews', type: 'feedback', threshold: 5 },
      { id: 'mvp_milestone', label: 'MVP milestone marked complete', type: 'milestone' },
    ],
    nextStage: 'traction',
  },
  traction: {
    name: 'Traction Stage',
    order: 3,
    unlockCriteria: [
      { id: 'active_users', label: '50+ active users or beta customers', type: 'manual' },
      { id: 'revenue_or_engagement', label: 'Revenue or strong engagement metrics', type: 'manual' },
      { id: 'product_market_fit', label: 'Evidence of product-market fit', type: 'feedback', threshold: 15 },
      { id: 'growth_milestone', label: 'Growth milestone achieved', type: 'milestone' },
    ],
    nextStage: 'investorReady',
  },
  investorReady: {
    name: 'Investor Ready',
    order: 4,
    unlockCriteria: [
      { id: 'pitch_deck', label: 'Investor pitch deck created', type: 'manual' },
      { id: 'financial_model', label: 'Financial projections ready', type: 'manual' },
      { id: 'team_complete', label: 'Core team in place', type: 'manual' },
      { id: 'traction_proof', label: 'Demonstrated traction metrics', type: 'manual' },
    ],
    nextStage: null,
  },
};

// Get investor readiness status
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    // Fetch startup and related data
    const [startupDoc, tasksSnapshot, milestonesSnapshot, feedbackSnapshot, manualChecksDoc] = await Promise.all([
      db.collection('startups').doc(startupId).get(),
      db.collection('tasks').where('startupId', '==', startupId).where('status', '==', 'done').get(),
      db.collection('milestones').where('startupId', '==', startupId).get(),
      db.collection('feedback').where('startupId', '==', startupId).get(),
      db.collection('investorReadiness').doc(startupId).get(),
    ]);

    const startup = startupDoc.data();
    const completedTasks = tasksSnapshot.size;
    const milestones = milestonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feedbackCount = feedbackSnapshot.size;
    const manualChecks = manualChecksDoc.exists ? manualChecksDoc.data() : {};

    // Determine current stage from startup data
    const currentStage = startup?.stage || 'idea';

    // Evaluate each stage
    const stageProgress = {};

    for (const [stageKey, stageData] of Object.entries(STAGES)) {
      const criteriaStatus = stageData.unlockCriteria.map(criterion => {
        let completed = false;

        switch (criterion.type) {
          case 'startup':
            completed = startup && startup.name && startup.industry;
            break;
          
          case 'tasks':
            completed = completedTasks >= criterion.threshold;
            break;
          
          case 'feedback':
            completed = feedbackCount >= criterion.threshold;
            break;
          
          case 'milestone':
            const milestoneKeywords = criterion.id === 'mvp_milestone' ? ['mvp', 'prototype', 'beta'] : ['growth', 'traction', 'scale'];
            const relevantMilestone = milestones.find(m => 
              milestoneKeywords.some(keyword => m.title.toLowerCase().includes(keyword)) && m.status === 'completed'
            );
            completed = !!relevantMilestone;
            break;
          
          case 'manual':
            completed = manualChecks[criterion.id] === true;
            break;
        }

        return {
          ...criterion,
          completed,
        };
      });

      const completedCount = criteriaStatus.filter(c => c.completed).length;
      const totalCount = criteriaStatus.length;

      stageProgress[stageKey] = {
        ...stageData,
        criteria: criteriaStatus,
        progress: Math.round((completedCount / totalCount) * 100),
        unlocked: completedCount === totalCount,
      };
    }

    // Calculate overall readiness score
    const totalCriteria = Object.values(stageProgress).reduce((sum, stage) => sum + stage.criteria.length, 0);
    const completedCriteria = Object.values(stageProgress).reduce(
      (sum, stage) => sum + stage.criteria.filter(c => c.completed).length,
      0
    );
    const readinessScore = Math.round((completedCriteria / totalCriteria) * 100);

    // Determine recommended next actions
    const currentStageData = stageProgress[currentStage];
    const nextActions = currentStageData.criteria
      .filter(c => !c.completed)
      .slice(0, 3)
      .map(c => c.label);

    res.json({
      currentStage,
      readinessScore,
      stageProgress,
      nextActions,
      canAdvance: currentStageData.unlocked && currentStageData.nextStage,
      nextStage: currentStageData.nextStage,
    });

  } catch (error) {
    console.error('Error fetching investor readiness:', error);
    res.status(500).json({ error: 'Failed to fetch investor readiness' });
  }
});

// Update manual criteria checks
router.post('/manual-check', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;
    const { criterionId, completed } = req.body;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    await db.collection('investorReadiness').doc(startupId).set(
      {
        [criterionId]: completed,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ success: true, message: 'Manual check updated' });

  } catch (error) {
    console.error('Error updating manual check:', error);
    res.status(500).json({ error: 'Failed to update manual check' });
  }
});

// Advance to next stage
router.post('/advance-stage', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const startupDoc = await db.collection('startups').doc(startupId).get();
    const startup = startupDoc.data();
    const currentStage = startup?.stage || 'idea';
    const nextStage = STAGES[currentStage]?.nextStage;

    if (!nextStage) {
      return res.status(400).json({ error: 'Already at final stage' });
    }

    await db.collection('startups').doc(startupId).update({
      stage: nextStage,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, newStage: nextStage });

  } catch (error) {
    console.error('Error advancing stage:', error);
    res.status(500).json({ error: 'Failed to advance stage' });
  }
});

module.exports = router;
