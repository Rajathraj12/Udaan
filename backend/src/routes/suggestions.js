const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const admin = require('firebase-admin');
const db = admin.firestore();

// Get AI-powered "What Should I Do Next?" suggestions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    // Fetch all relevant data
    const [
      startupDoc,
      tasksSnapshot,
      milestonesSnapshot,
      feedbackSnapshot,
      decisionsSnapshot,
      assumptionsSnapshot,
    ] = await Promise.all([
      db.collection('startups').doc(startupId).get(),
      db.collection('tasks').where('startupId', '==', startupId).get(),
      db.collection('milestones').where('startupId', '==', startupId).get(),
      db.collection('feedback').where('startupId', '==', startupId).get(),
      db.collection('decisions').where('startupId', '==', startupId).get(),
      db.collection('assumptions').where('startupId', '==', startupId).get(),
    ]);

    const startup = startupDoc.data();
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const milestones = milestonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feedbacks = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const decisions = decisionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const assumptions = assumptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const suggestions = [];
    const now = new Date();

    // RULE 1: Overdue tasks exist -> Suggest addressing them
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'done' || !task.dueDate) return false;
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return dueDate < now;
    });

    if (overdueTasks.length > 0) {
      const highPriorityOverdue = overdueTasks.filter(t => t.priority === 'high').slice(0, 2);
      suggestions.push({
        category: 'Urgent',
        priority: 'high',
        action: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue tasks. Focus on completing high-priority items first.`,
        tasks: highPriorityOverdue.map(t => ({ id: t.id, title: t.title })),
        icon: '⚠️',
      });
    }

    // RULE 2: No recent feedback -> Suggest customer conversations
    const recentFeedback = feedbacks.filter(f => {
      const feedbackDate = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      const daysAgo = (now - feedbackDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 14;
    });

    if (recentFeedback.length < 3) {
      suggestions.push({
        category: 'Validation',
        priority: 'high',
        action: 'Talk to Customers',
        description: `Only ${recentFeedback.length} customer conversations in 2 weeks. Schedule 3-5 interviews this week.`,
        icon: '💬',
        cta: 'Add Feedback',
      });
    }

    // RULE 3: Untested assumptions -> Suggest validation
    const untestedAssumptions = assumptions.filter(a => a.status === 'untested' && a.priority === 'high');

    if (untestedAssumptions.length > 0) {
      suggestions.push({
        category: 'Validation',
        priority: 'medium',
        action: 'Test Critical Assumptions',
        description: `${untestedAssumptions.length} high-priority assumptions need validation. Start with customer problem assumptions.`,
        assumptions: untestedAssumptions.slice(0, 3).map(a => ({ id: a.id, hypothesis: a.hypothesis })),
        icon: '🔬',
        cta: 'View Assumption Board',
      });
    }

    // RULE 4: Milestone approaching -> Focus energy
    const upcomingMilestones = milestones.filter(m => {
      if (m.status === 'completed' || !m.targetDate) return false;
      const targetDate = m.targetDate.toDate ? m.targetDate.toDate() : new Date(m.targetDate);
      const daysUntil = (targetDate - now) / (1000 * 60 * 60 * 24);
      return daysUntil <= 14 && daysUntil > 0;
    });

    if (upcomingMilestones.length > 0) {
      const nextMilestone = upcomingMilestones[0];
      const relatedTasks = tasks.filter(t => t.milestone === nextMilestone.title && t.status !== 'done');
      
      suggestions.push({
        category: 'Focus',
        priority: 'high',
        action: `Focus on "${nextMilestone.title}"`,
        description: `Milestone due soon. ${relatedTasks.length} related tasks remaining.`,
        milestone: { id: nextMilestone.id, title: nextMilestone.title },
        icon: '🎯',
      });
    }

    // RULE 5: Stage-specific suggestions
    const stage = startup?.stage || 'idea';

    if (stage === 'idea') {
      suggestions.push({
        category: 'Stage Guidance',
        priority: 'medium',
        action: 'Define Your MVP',
        description: 'Create tasks for MVP features, schedule customer interviews, and document assumptions.',
        icon: '💡',
      });
    } else if (stage === 'mvp') {
      const mvpMilestone = milestones.find(m => 
        m.title.toLowerCase().includes('mvp') && m.status !== 'completed'
      );
      
      if (mvpMilestone) {
        suggestions.push({
          category: 'Stage Guidance',
          priority: 'high',
          action: 'Ship Your MVP',
          description: 'Focus all energy on getting MVP into customer hands. Gather 10+ feedback sessions.',
          icon: '🚀',
        });
      }
    } else if (stage === 'traction') {
      suggestions.push({
        category: 'Stage Guidance',
        priority: 'medium',
        action: 'Prove Product-Market Fit',
        description: 'Track engagement metrics, retention, and NPS. Document traction for investors.',
        icon: '📈',
      });
    }

    // RULE 6: No recent activity -> Wake up call
    const recentTasks = tasks.filter(t => {
      if (!t.updatedAt) return false;
      const updateDate = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
      const daysAgo = (now - updateDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 3;
    });

    if (recentTasks.length === 0 && tasks.length > 0) {
      suggestions.push({
        category: 'Momentum',
        priority: 'high',
        action: 'Break the Standstill',
        description: 'No progress in 3+ days. Pick ONE small task and complete it today.',
        icon: '⏰',
      });
    }

    // RULE 7: Decision pending review
    const decisionsToReview = decisions.filter(d => {
      if (!d.reviewDate || d.status !== 'active') return false;
      const reviewDate = d.reviewDate.toDate ? d.reviewDate.toDate() : new Date(d.reviewDate);
      return reviewDate <= now;
    });

    if (decisionsToReview.length > 0) {
      suggestions.push({
        category: 'Accountability',
        priority: 'medium',
        action: 'Review Past Decisions',
        description: `${decisionsToReview.length} decisions need outcome review. Update status and learnings.`,
        decisions: decisionsToReview.slice(0, 2).map(d => ({ id: d.id, title: d.title })),
        icon: '📝',
        cta: 'Open Decision Log',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json({
      suggestions: suggestions.slice(0, 5), // Top 5 most relevant
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = router;
