import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function generateCheckInCode() {
  return `EVT-${Date.now().toString(36).toUpperCase()}`;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    const { eventId, rsvpStatus, search, checkInStatus, dietaryPreference } = req.query;

    if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    } else if (req.user.role === 'guest') {
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { userId: new ObjectId(req.user.id) },
        { email: new RegExp('^' + escapeRegExp(req.user.email) + '$', 'i') },
      ];
    } else if (req.user.role === 'staff') {
      const events = await db.collection('events').find({ staffIds: new ObjectId(req.user.id) }).toArray();
      filter.eventId = { $in: events.map((e) => e._id) };
    }

    if (eventId) filter.eventId = new ObjectId(eventId);
    if (rsvpStatus) filter.rsvpStatus = rsvpStatus;
    if (checkInStatus) filter.checkInStatus = checkInStatus;
    if (dietaryPreference) filter.dietaryPreferences = new RegExp(dietaryPreference, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const guests = await db.collection('guests').find(filter).toArray();
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const guest = {
      ...req.body,
      eventId: new ObjectId(req.body.eventId),
      organizerId: new ObjectId(req.user.id),
      userId: req.body.userId ? new ObjectId(req.body.userId) : null,
      rsvpStatus: 'pending',
      checkInStatus: 'not_arrived',
      checkInCode: generateCheckInCode(),
      invitationSent: false,
      createdAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('guests').insertOne(guest);
    res.status(201).json({ id: result.insertedId, ...guest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add guest' });
  }
});

router.post('/invite-all', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { eventId } = req.body;
    const db = getDB();
    const result = await db.collection('guests').updateMany(
      { eventId: new ObjectId(eventId), organizerId: new ObjectId(req.user.id), invitationSent: false },
      { $set: { invitationSent: true, invitedAt: new Date() } }
    );
    res.json({ message: `Sent ${result.modifiedCount} invitations` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send bulk invitations' });
  }
});

router.post('/:id/invite', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    await db.collection('guests').updateOne(
      { _id: new ObjectId(req.params.id), organizerId: new ObjectId(req.user.id) },
      { $set: { invitationSent: true, invitedAt: new Date() } }
    );
    const guest = await db.collection('guests').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Invitation sent', guest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

router.patch('/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const { rsvpStatus, dietaryPreferences, specialRequirements } = req.body;
    const valid = ['attending', 'not_attending', 'maybe', 'pending'];
    if (rsvpStatus && !valid.includes(rsvpStatus)) {
      return res.status(400).json({ error: 'Invalid RSVP status' });
    }

    const db = getDB();
    const guest = await db.collection('guests').findOne({ _id: new ObjectId(req.params.id) });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const canRsvp =
      req.user.role === 'organizer' ||
      (req.user.role === 'guest' && (guest.userId?.toString() === req.user.id || guest.email === req.user.email));

    if (!canRsvp) return res.status(403).json({ error: 'Not authorized' });

    await db.collection('guests').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { rsvpStatus, dietaryPreferences, specialRequirements, rsvpAt: new Date() } }
    );
    const updated = await db.collection('guests').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'RSVP recorded successfully', guest: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
});

router.patch('/check-in-by-code', requireAuth, requireRole('staff', 'organizer'), async (req, res) => {
  try {
    const { code } = req.body;
    const db = getDB();
    const guest = await db.collection('guests').findOne({ checkInCode: code });
    if (!guest) return res.status(404).json({ error: 'Invalid check-in code' });

    if (guest.checkInStatus === 'arrived') {
      return res.status(400).json({ error: `This ticket has already been checked in! (${new Date(guest.checkedInAt).toLocaleTimeString()})` });
    }

    await db.collection('guests').updateOne(
      { _id: guest._id },
      { $set: { checkInStatus: 'arrived', checkedInAt: new Date(), checkedInBy: req.user.id } }
    );
    const updated = await db.collection('guests').findOne({ _id: guest._id });
    res.json({ message: 'Guest checked in', guest: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in guest' });
  }
});

router.patch('/:id/checkin', requireAuth, requireRole('staff', 'organizer'), async (req, res) => {
  try {
    const db = getDB();
    const guest = await db.collection('guests').findOne({ _id: new ObjectId(req.params.id) });
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    if (guest.checkInStatus === 'arrived') {
      return res.status(400).json({ error: `This guest is already checked in! (${new Date(guest.checkedInAt).toLocaleTimeString()})` });
    }

    await db.collection('guests').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { checkInStatus: 'arrived', checkedInAt: new Date(), checkedInBy: req.user.id } }
    );
    const updated = await db.collection('guests').findOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Guest checked in', guest: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in guest' });
  }
});

export default router;
