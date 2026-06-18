import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    if (req.query.eventId) filter.eventId = new ObjectId(req.query.eventId);
    if (req.user.role === 'organizer') filter.organizerId = new ObjectId(req.user.id);

    const feedback = await db.collection('feedback').find(filter).sort({ submittedAt: -1 }).toArray();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { eventId, guestRecordId, overallRating, foodRating, venueRating, organizationRating, comments } = req.body;
    const db = getDB();
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const guestRecord = guestRecordId
      ? await db.collection('guests').findOne({ _id: new ObjectId(guestRecordId) })
      : null;

    const feedback = {
      eventId: new ObjectId(eventId),
      organizerId: event.organizerId,
      guestRecordId: guestRecord?._id || null,
      guestUserId: new ObjectId(req.user.id),
      guestName: req.user.name,
      overallRating,
      foodRating,
      venueRating,
      organizationRating,
      comments,
      submittedAt: new Date(),
    };

    const result = await db.collection('feedback').insertOne(feedback);
    res.status(201).json({ id: result.insertedId, message: 'Thank you for your feedback!', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;
