import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};
    const { status, venueId, dateFrom, dateTo } = req.query;

    if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    } else if (req.user.role === 'venue_owner') {
      const venues = await db.collection('venues').find({ ownerId: new ObjectId(req.user.id) }).toArray();
      filter.venueId = { $in: venues.map((v) => v._id) };
    }

    if (status) filter.status = status;
    if (venueId) filter.venueId = new ObjectId(venueId);
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    const bookings = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).toArray();

    if (req.user.role === 'venue_owner') {
      for (const booking of bookings) {
        const organizer = await db.collection('users').findOne(
          { _id: booking.organizerId },
          { projection: { passwordHash: 0 } }
        );
        booking.organizerContact = organizer
          ? { name: organizer.name, email: organizer.email, phone: organizer.profile?.phone }
          : null;
      }
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { venueId, eventType, date, expectedAttendees, specialRequirements, message } = req.body;
    if (!venueId || !date || !eventType) {
      return res.status(400).json({ error: 'venueId, date, and eventType are required' });
    }

    const db = getDB();
    const organizer = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const booking = {
      venueId: new ObjectId(venueId),
      organizerId: new ObjectId(req.user.id),
      organizerName: organizer.name,
      eventType,
      date,
      expectedAttendees: expectedAttendees || 0,
      specialRequirements: specialRequirements || '',
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('bookings').insertOne(booking);
    res.status(201).json({ id: result.insertedId, ...booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit booking request' });
  }
});

router.patch('/:id/respond', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const { status, counterMessage, adjustedPricing } = req.body;
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or declined' });
    }

    const db = getDB();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(req.params.id) });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const venue = await db.collection('venues').findOne({ _id: booking.venueId });
    if (!venue || venue.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to respond to this booking' });
    }

    const update = { status, respondedAt: new Date(), counterMessage, adjustedPricing };
    await db.collection('bookings').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const updated = await db.collection('bookings').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to booking' });
  }
});

export default router;
