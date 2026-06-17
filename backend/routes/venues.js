import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const db = getDB();
    const venues = await db.collection('venues').find({ ownerId: new ObjectId(req.user.id) }).toArray();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your venues' });
  }
});

router.get('/analytics/summary', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const db = getDB();
    const ownerId = new ObjectId(req.user.id);
    const venues = await db.collection('venues').find({ ownerId }).toArray();
    const venueIds = venues.map((v) => v._id);
    const bookings = await db.collection('bookings').find({ venueId: { $in: venueIds } }).toArray();

    const perListing = venues.map((venue) => {
      const venueBookings = bookings.filter((b) => b.venueId.toString() === venue._id.toString());
      const approved = venueBookings.filter((b) => b.status === 'approved');
      return {
        venueId: venue._id,
        venueName: venue.name,
        totalRequests: venueBookings.length,
        approvedBookings: approved.length,
        bookingRate: venueBookings.length ? (approved.length / venueBookings.length) * 100 : 0,
        revenue: approved.reduce((sum, b) => sum + (b.adjustedPricing || venue.pricing?.daily || 0), 0),
      };
    });

    res.json({
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === 'approved').length,
      totalRevenue: perListing.reduce((s, v) => s + v.revenue, 0),
      perListing,
      history: bookings.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { city, minCapacity, maxCapacity, minDimensions, amenity, date, search } = req.query;
    const filter = { active: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minCapacity) filter.capacity = { ...filter.capacity, $gte: Number(minCapacity) };
    if (maxCapacity) filter.capacity = { ...filter.capacity, $lte: Number(maxCapacity) };
    if (minDimensions) filter.dimensions = { $gte: Number(minDimensions) };
    if (amenity) filter.amenities = amenity;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
      ];
    }

    const db = getDB();
    let venues = await db.collection('venues').find(filter).toArray();

    if (date) {
      venues = venues.filter((v) => !(v.unavailableDates || []).includes(date));
    }

    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const venue = await db.collection('venues').findOne({ _id: new ObjectId(req.params.id) });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

router.post('/', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const venue = {
      ...req.body,
      ownerId: new ObjectId(req.user.id),
      active: true,
      unavailableDates: req.body.unavailableDates || [],
      photos: req.body.photos || [],
      createdAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('venues').insertOne(venue);
    res.status(201).json({ id: result.insertedId, ...venue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

router.put('/:id', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const db = getDB();
    const venue = await db.collection('venues').findOne({ _id: new ObjectId(req.params.id) });
    if (!venue || venue.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { _id, ownerId, ...updates } = req.body;
    updates.updatedAt = new Date();
    await db.collection('venues').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    const updated = await db.collection('venues').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

router.patch('/:id/availability', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const { unavailableDates } = req.body;
    const db = getDB();
    await db.collection('venues').updateOne(
      { _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.id) },
      { $set: { unavailableDates, updatedAt: new Date() } }
    );
    const venue = await db.collection('venues').findOne({ _id: new ObjectId(req.params.id) });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

router.patch('/:id/deactivate', requireAuth, requireRole('venue_owner'), async (req, res) => {
  try {
    const db = getDB();
    await db.collection('venues').updateOne(
      { _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.id) },
      { $set: { active: false, deactivatedAt: new Date() } }
    );
    res.json({ message: 'Venue deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate venue' });
  }
});

export default router;
