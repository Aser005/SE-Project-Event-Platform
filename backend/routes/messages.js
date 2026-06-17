import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    if (req.query.eventId) filter.eventId = new ObjectId(req.query.eventId);

    if (req.user.role === 'guest') {
      const guestRecords = await db.collection('guests').find({ userId: new ObjectId(req.user.id) }).toArray();
      filter.guestId = { $in: guestRecords.map((g) => g._id) };
    } else if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    }

    const messages = await db.collection('messages').find(filter).sort({ sentAt: -1 }).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { eventId, guestIds, subject, body, type } = req.body;
    const db = getDB();
    const messages = [];

    for (const guestId of guestIds) {
      messages.push({
        eventId: new ObjectId(eventId),
        guestId: new ObjectId(guestId),
        organizerId: new ObjectId(req.user.id),
        subject,
        body,
        type: type || 'day_of',
        status: 'sent',
        seen: false,
        sentAt: new Date(),
      });
    }

    if (messages.length) {
      await db.collection('messages').insertMany(messages);
    }
    res.status(201).json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send messages' });
  }
});

router.post('/follow-up', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { eventId } = req.body;
    const db = getDB();
    const unseen = await db.collection('messages').find({
      eventId: new ObjectId(eventId),
      organizerId: new ObjectId(req.user.id),
      seen: false,
    }).toArray();

    const followUps = unseen.map((m) => ({
      ...m,
      _id: undefined,
      subject: `Follow-up: ${m.subject}`,
      body: `Reminder: ${m.body}`,
      isFollowUp: true,
      sentAt: new Date(),
    }));

    if (followUps.length) {
      await db.collection('messages').insertMany(followUps);
    }
    res.json({ count: followUps.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send follow-up messages' });
  }
});

router.patch('/:id/seen', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    await db.collection('messages').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { seen: true, seenAt: new Date() } }
    );
    res.json({ message: 'Marked as seen' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as seen' });
  }
});

export default router;
