const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get all tasks for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const startupId = req.user.startupId;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with this user' });
    }
    
    const tasksSnapshot = await db.collection('tasks')
      .where('startupId', '==', startupId)
      .get();

    const tasks = [];
    tasksSnapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, milestoneId, tags } = req.body;
    const startupId = req.user.startupId;
    
    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with this user' });
    }
    
    const taskData = {
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate,
      milestoneId: milestoneId || null,
      tags: tags || [],
      startupId,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('tasks').add(taskData);
    
    res.status(201).json({ id: docRef.id, ...taskData });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('tasks').doc(id).update(updateData);
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.collection('tasks').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    
    res.json({ message: 'Task status updated successfully', status });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('tasks').doc(id).delete();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
