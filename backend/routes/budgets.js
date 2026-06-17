import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/:eventId', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const budget = await db.collection('budgets').findOne({ eventId: new ObjectId(req.params.eventId) });
    res.json(budget || { plannedTotal: 0, breakdown: [], actualExpenses: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

router.put('/:eventId', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const eventId = new ObjectId(req.params.eventId);
    const data = {
      eventId,
      organizerId: new ObjectId(req.user.id),
      plannedTotal: req.body.plannedTotal || 0,
      breakdown: req.body.breakdown || [],
      actualExpenses: req.body.actualExpenses || [],
      updatedAt: new Date(),
    };

    await db.collection('budgets').updateOne(
      { eventId },
      { $set: data, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const budget = await db.collection('budgets').findOne({ eventId });
    const actualTotal = (budget.actualExpenses || []).reduce((s, e) => s + e.amount, 0);
    res.json({ ...budget, actualTotal, difference: budget.plannedTotal - actualTotal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.post('/:eventId/expenses', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const expense = { ...req.body, id: new ObjectId().toString(), recordedAt: new Date() };
    const db = getDB();
    await db.collection('budgets').updateOne(
      { eventId: new ObjectId(req.params.eventId) },
      { $push: { actualExpenses: expense }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );
    const budget = await db.collection('budgets').findOne({ eventId: new ObjectId(req.params.eventId) });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

export default router;
