import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    const { date, status } = req.query;

    if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    } else if (req.user.role === 'staff') {
      filter.staffIds = new ObjectId(req.user.id);
    } else if (req.user.role === 'vendor') {
      const requests = await db.collection('sourcing_requests').find({ vendorId: new ObjectId(req.user.id) }).toArray();
      filter._id = { $in: requests.map((r) => r.eventId) };
    }

    if (date) filter.date = date;
    if (status) filter.status = status;

    const events = await db.collection('events').find(filter).sort({ date: 1 }).toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/dashboard/today', requireAuth, requireRole('organizer', 'staff'), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const db = getDB();
    const filter = { date: today };
    if (req.user.role === 'organizer') filter.organizerId = new ObjectId(req.user.id);
    if (req.user.role === 'staff') filter.staffIds = new ObjectId(req.user.id);

    const events = await db.collection('events').find(filter).toArray();
    const eventIds = events.map((e) => e._id);

    const guests = await db.collection('guests').find({ eventId: { $in: eventIds } }).toArray();
    const feedback = await db.collection('feedback').find({ eventId: { $in: eventIds } }).toArray();
    const tasks = await db.collection('tasks').find({ eventId: { $in: eventIds } }).toArray();

    const positive = feedback.filter((f) => f.overallRating >= 4).length;
    const negative = feedback.filter((f) => f.overallRating <= 2).length;

    res.json({
      todayEvents: events,
      guestStats: {
        total: guests.length,
        arrived: guests.filter((g) => g.checkInStatus === 'arrived').length,
        rsvpAttending: guests.filter((g) => g.rsvpStatus === 'attending').length,
      },
      feedbackStats: { positive, negative, total: feedback.length },
      tasksDue: tasks.filter((t) => t.status !== 'done' && t.dueDate <= today),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const event = {
      ...req.body,
      organizerId: new ObjectId(req.user.id),
      staffIds: (req.body.staffIds || []).map((id) => new ObjectId(id)),
      venueId: req.body.venueId ? new ObjectId(req.body.venueId) : null,
      status: req.body.status || 'planning',
      createdAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('events').insertOne(event);
    res.status(201).json({ id: result.insertedId, ...event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.put('/:id', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const { _id, organizerId, ...updates } = req.body;
    updates.updatedAt = new Date();
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id), organizerId: new ObjectId(req.user.id) },
      { $set: updates }
    );
    const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.patch('/:id/selected-layout', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const { layoutId } = req.body;
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id), organizerId: new ObjectId(req.user.id) },
      { $set: { selectedLayoutId: layoutId ? new ObjectId(layoutId) : null, updatedAt: new Date() } }
    );
    res.json({ success: true, layoutId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set selected layout' });
  }
});

router.get('/:id/report', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const eventId = new ObjectId(req.params.id);
    const event = await db.collection('events').findOne({ _id: eventId });
    const guests = await db.collection('guests').find({ eventId }).toArray();
    const budget = await db.collection('budgets').findOne({ eventId });
    const feedback = await db.collection('feedback').find({ eventId }).toArray();
    const tasks = await db.collection('tasks').find({ eventId }).toArray();
    const proposals = await db.collection('sourcing_requests').find({ eventId, status: 'accepted' }).toArray();
    
    let selectedLayout = null;
    if (event.selectedLayoutId) {
      selectedLayout = await db.collection('floor_plans').findOne({ _id: new ObjectId(event.selectedLayoutId) });
    }

    const expenses = budget?.actualExpenses || [];

    res.json({
      event,
      selectedLayout,
      tasks,
      proposals,
      attendance: {
        invited: guests.length,
        attending: guests.filter((g) => g.rsvpStatus === 'attending').length,
        arrived: guests.filter((g) => g.checkInStatus === 'arrived').length,
      },
      budget: budget ? {
        planned: budget.plannedTotal,
        actual: expenses.reduce((sum, e) => sum + e.amount, 0),
        difference: budget.plannedTotal - expenses.reduce((sum, e) => sum + e.amount, 0),
        breakdown: budget.breakdown,
        expenses,
      } : null,
      feedback: {
        count: feedback.length,
        averageRating: feedback.length
          ? feedback.reduce((s, f) => s + f.overallRating, 0) / feedback.length
          : 0,
        items: feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
