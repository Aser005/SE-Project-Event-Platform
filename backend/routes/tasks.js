import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    const { status, eventId } = req.query;

    if (req.user.role === 'staff') {
      filter.assignedTo = new ObjectId(req.user.id);
    } else if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    }

    if (status) filter.status = status;
    if (eventId) filter.eventId = new ObjectId(eventId);

    const tasks = await db.collection('tasks').find(filter).sort({ dueDate: 1 }).toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const task = {
      ...req.body,
      eventId: new ObjectId(req.body.eventId),
      organizerId: new ObjectId(req.user.id),
      assignedTo: req.body.assignedTo ? new ObjectId(req.body.assignedTo) : null,
      status: req.body.status || 'pending',
      createdAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('tasks').insertOne(task);
    res.status(201).json({ id: result.insertedId, ...task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id/assign', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const db = getDB();
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { assignedTo: new ObjectId(assignedTo), status: 'in_progress', assignedAt: new Date() } }
    );
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(req.params.id) });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDB();
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(req.params.id) });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const canUpdate =
      req.user.role === 'organizer' ||
      (req.user.role === 'staff' && task.assignedTo?.toString() === req.user.id);

    if (!canUpdate) return res.status(403).json({ error: 'Not authorized' });

    await db.collection('tasks').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    const updated = await db.collection('tasks').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

export default router;
