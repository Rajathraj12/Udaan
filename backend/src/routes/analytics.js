const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get analytics data for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.query;
    
    // Fetch tasks
    const tasksSnapshot = await db.collection('tasks')
      .where('startupId', '==', startupId)
      .get();
    
    // Fetch milestones
    const milestonesSnapshot = await db.collection('milestones')
      .where('startupId', '==', startupId)
      .get();
    
    // Fetch feedback
    const feedbackSnapshot = await db.collection('feedbackResponses')
      .where('startupId', '==', startupId)
      .get();

    const tasks = [];
    const milestones = [];
    const feedback = [];

    tasksSnapshot.forEach(doc => tasks.push(doc.data()));
    milestonesSnapshot.forEach(doc => milestones.push(doc.data()));
    feedbackSnapshot.forEach(doc => feedback.push(doc.data()));

    // Calculate statistics
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'inProgress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
      },
      tasksByPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
      },
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter(m => m.status === 'completed').length,
      averageMilestoneProgress: milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / milestones.length || 0,
      feedbackCount: feedback.length,
      feedbackSentiment: {
        positive: feedback.filter(f => f.sentiment === 'positive').length,
        neutral: feedback.filter(f => f.sentiment === 'neutral').length,
        negative: feedback.filter(f => f.sentiment === 'negative').length,
      },
      progressScore: Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
