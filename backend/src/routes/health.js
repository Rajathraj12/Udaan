const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const admin = require('firebase-admin');
const db = admin.firestore();

// Calculate Startup Health Score (0-100)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId } = req.user;

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    // Fetch all relevant data in parallel
    const [tasksSnapshot, milestonesSnapshot, feedbackSnapshot, startupDoc] = await Promise.all([
      db.collection('tasks').where('startupId', '==', startupId).get(),
      db.collection('milestones').where('startupId', '==', startupId).get(),
      db.collection('feedback').where('startupId', '==', startupId).get(),
      db.collection('startups').doc(startupId).get(),
    ]);

    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const milestones = milestonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feedbacks = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const startup = startupDoc.data();

    // Initialize health score
    let healthScore = 100;
    const risks = [];
    const now = new Date();

    // 1. OVERDUE TASKS RISK (-30 points max)
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'done' || !task.dueDate) return false;
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return dueDate < now;
    });

    const overdueDeduction = Math.min(overdueTasks.length * 5, 30);
    healthScore -= overdueDeduction;

    if (overdueTasks.length > 0) {
      risks.push({
        category: 'Overdue Tasks',
        severity: overdueTasks.length >= 5 ? 'high' : 'medium',
        impact: overdueDeduction,
        description: `${overdueTasks.length} tasks past deadline`,
        recommendation: 'Review and reschedule overdue tasks or mark as complete',
      });
    }

    // 2. FOUNDER OVERLOAD RISK (-25 points max)
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const founderOverload = activeTasks.length > 15;
    
    if (founderOverload) {
      const overloadDeduction = Math.min((activeTasks.length - 15) * 2, 25);
      healthScore -= overloadDeduction;
      
      risks.push({
        category: 'Founder Overload',
        severity: activeTasks.length > 25 ? 'high' : 'medium',
        impact: overloadDeduction,
        description: `${activeTasks.length} active tasks (recommended: 10-15)`,
        recommendation: 'Delegate, prioritize ruthlessly, or extend timelines',
      });
    }

    // 3. VALIDATION GAP RISK (-20 points max)
    const recentFeedback = feedbacks.filter(f => {
      const feedbackDate = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      const daysAgo = (now - feedbackDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    if (recentFeedback.length < 5) {
      const validationDeduction = 20;
      healthScore -= validationDeduction;
      
      risks.push({
        category: 'Validation Gap',
        severity: recentFeedback.length === 0 ? 'high' : 'medium',
        impact: validationDeduction,
        description: `Only ${recentFeedback.length} customer conversations in last 30 days (need 5+)`,
        recommendation: 'Schedule customer interviews, send surveys, or run user tests',
      });
    }

    // 4. MILESTONE DELAY RISK (-15 points max)
    const delayedMilestones = milestones.filter(m => {
      if (m.status === 'completed' || !m.targetDate) return false;
      const targetDate = m.targetDate.toDate ? m.targetDate.toDate() : new Date(m.targetDate);
      return targetDate < now;
    });

    if (delayedMilestones.length > 0) {
      const delayDeduction = Math.min(delayedMilestones.length * 5, 15);
      healthScore -= delayDeduction;
      
      risks.push({
        category: 'Milestone Delays',
        severity: delayedMilestones.length >= 3 ? 'high' : 'medium',
        impact: delayDeduction,
        description: `${delayedMilestones.length} milestones behind schedule`,
        recommendation: 'Re-baseline timelines or allocate more resources',
      });
    }

    // 5. NO RECENT PROGRESS RISK (-10 points max)
    const recentTasks = tasks.filter(t => {
      if (!t.updatedAt) return false;
      const updateDate = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
      const daysAgo = (now - updateDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    if (recentTasks.length === 0 && tasks.length > 0) {
      healthScore -= 10;
      
      risks.push({
        category: 'Stagnation',
        severity: 'low',
        impact: 10,
        description: 'No task updates in the last 7 days',
        recommendation: 'Break down large tasks or schedule daily standups',
      });
    }

    // Sort risks by impact (descending)
    risks.sort((a, b) => b.impact - a.impact);

    // Determine risk level
    let riskLevel, riskColor;
    if (healthScore >= 80) {
      riskLevel = 'Healthy';
      riskColor = '#10b981'; // green
    } else if (healthScore >= 60) {
      riskLevel = 'Moderate Risk';
      riskColor = '#f59e0b'; // yellow
    } else if (healthScore >= 40) {
      riskLevel = 'High Risk';
      riskColor = '#f97316'; // orange
    } else {
      riskLevel = 'Critical Risk';
      riskColor = '#ef4444'; // red
    }

    // Calculate trend (mock for now, in production store historical scores)
    const trend = healthScore >= 70 ? 'improving' : healthScore >= 50 ? 'stable' : 'declining';

    res.json({
      healthScore: Math.max(0, Math.round(healthScore)),
      riskLevel,
      riskColor,
      trend,
      topRisks: risks.slice(0, 2), // Top 2 risks
      allRisks: risks,
      metrics: {
        totalTasks: tasks.length,
        activeTasks: activeTasks.length,
        overdueTasks: overdueTasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        totalMilestones: milestones.length,
        delayedMilestones: delayedMilestones.length,
        recentFeedback: recentFeedback.length,
        lastActivity: recentTasks.length > 0 ? recentTasks[0].updatedAt : null,
      },
      recommendations: risks.slice(0, 3).map(r => r.recommendation),
    });

  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

module.exports = router;
