const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// Get budget for a startup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startupId, role } = req.user;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can access budget' });
    }

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const budgetSnapshot = await db.collection('budgets')
      .where('startupId', '==', startupId)
      .limit(1)
      .get();

    if (budgetSnapshot.empty) {
      return res.json(null);
    }

    const budgetDoc = budgetSnapshot.docs[0];
    res.json({ id: budgetDoc.id, ...budgetDoc.data() });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Create or update budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startupId, uid, role } = req.user;
    const { totalBudget, fundingType, phases } = req.body;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can manage budget' });
    }

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const budgetData = {
      startupId,
      createdBy: uid,
      totalBudget: parseFloat(totalBudget),
      fundingType,
      phases: phases?.map(p => ({
        name: p.name,
        amount: parseFloat(p.amount || 0)
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if budget exists
    const existingBudget = await db.collection('budgets')
      .where('startupId', '==', startupId)
      .limit(1)
      .get();

    if (!existingBudget.empty) {
      // Update existing
      const budgetId = existingBudget.docs[0].id;
      await db.collection('budgets').doc(budgetId).update({
        ...budgetData,
        createdAt: existingBudget.docs[0].data().createdAt, // Preserve original
      });
      res.json({ id: budgetId, ...budgetData });
    } else {
      // Create new
      const docRef = await db.collection('budgets').add(budgetData);
      res.status(201).json({ id: docRef.id, ...budgetData });
    }
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// Get expenses for a startup
router.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const { startupId, role } = req.user;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can access expenses' });
    }

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const expensesSnapshot = await db.collection('expenses')
      .where('startupId', '==', startupId)
      .get();

    const expenses = expensesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add expense
router.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const { startupId, uid, role } = req.user;
    const { name, category, amount, phase } = req.body;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can add expenses' });
    }

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    if (!name || !amount) {
      return res.status(400).json({ error: 'Name and amount are required' });
    }

    const expenseData = {
      startupId,
      createdBy: uid,
      name,
      category: category || 'misc',
      amount: parseFloat(amount),
      phase: phase || 'Validation',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('expenses').add(expenseData);

    res.status(201).json({ id: docRef.id, ...expenseData });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const { startupId, role } = req.user;
    const { id } = req.params;

    if (role !== 'founder') {
      return res.status(403).json({ error: 'Only founders can delete expenses' });
    }

    if (!startupId) {
      return res.status(400).json({ error: 'No startup associated with user' });
    }

    const expenseDoc = await db.collection('expenses').doc(id).get();

    if (!expenseDoc.exists) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expenseDoc.data().startupId !== startupId) {
      return res.status(403).json({ error: 'Not authorized to delete this expense' });
    }

    await db.collection('expenses').doc(id).delete();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
