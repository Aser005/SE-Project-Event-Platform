import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { search, supplies } = req.query;
    const filter = { role: 'vendor', active: true };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'profile.companyName': new RegExp(search, 'i') },
        { 'profile.supplies': new RegExp(search, 'i') },
      ];
    }
    if (supplies) filter['profile.supplies'] = new RegExp(supplies, 'i');

    const vendors = await db.collection('users')
      .find(filter, { projection: { passwordHash: 0 } })
      .toArray();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.get('/requests', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};

    if (req.user.role === 'organizer') {
      filter.organizerId = new ObjectId(req.user.id);
    } else if (req.user.role === 'vendor') {
      filter.vendorId = new ObjectId(req.user.id);
    }

    const requests = await db.collection('sourcing_requests').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sourcing requests' });
  }
});

router.post('/requests', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const request = {
      ...req.body,
      eventId: new ObjectId(req.body.eventId),
      vendorId: new ObjectId(req.body.vendorId),
      organizerId: new ObjectId(req.user.id),
      status: 'pending',
      deliveryStatus: 'pending',
      createdAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('sourcing_requests').insertOne(request);
    res.status(201).json({ id: result.insertedId, ...request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sourcing request' });
  }
});

router.patch('/requests/:id/respond', requireAuth, requireRole('vendor'), async (req, res) => {
  try {
    const { status, message } = req.body;
    const db = getDB();
    await db.collection('sourcing_requests').updateOne(
      { _id: new ObjectId(req.params.id), vendorId: new ObjectId(req.user.id) },
      { $set: { status, vendorMessage: message, respondedAt: new Date() } }
    );
    const updated = await db.collection('sourcing_requests').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

router.patch('/requests/:id/delivery', requireAuth, requireRole('vendor', 'staff', 'organizer'), async (req, res) => {
  try {
    const { deliveryStatus, delayNote } = req.body;
    const db = getDB();
    await db.collection('sourcing_requests').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { deliveryStatus, delayNote, deliveryUpdatedAt: new Date() } }
    );
    const updated = await db.collection('sourcing_requests').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection('sourcing_requests')
      .find({ eventId: new ObjectId(req.params.eventId), status: 'accepted' })
      .toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event vendors' });
  }
});

export default router;
