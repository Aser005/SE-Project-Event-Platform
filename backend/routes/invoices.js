import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const filter = {};

    if (req.user.role === 'vendor') filter.vendorId = new ObjectId(req.user.id);
    if (req.user.role === 'organizer') filter.organizerId = new ObjectId(req.user.id);
    if (req.query.status) filter.status = req.query.status;

    const invoices = await db.collection('invoices').find(filter).sort({ submittedAt: -1 }).toArray();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/', requireAuth, requireRole('vendor'), async (req, res) => {
  try {
    const invoice = {
      ...req.body,
      eventId: new ObjectId(req.body.eventId),
      vendorId: new ObjectId(req.user.id),
      organizerId: new ObjectId(req.body.organizerId),
      status: 'pending_review',
      submittedAt: new Date(),
    };
    const db = getDB();
    const result = await db.collection('invoices').insertOne(invoice);
    res.status(201).json({ id: result.insertedId, ...invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit invoice' });
  }
});

router.patch('/:id/review', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDB();
    await db.collection('invoices').updateOne(
      { _id: new ObjectId(req.params.id), organizerId: new ObjectId(req.user.id) },
      { $set: { status, reviewedAt: new Date() } }
    );
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(req.params.id) });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to review invoice' });
  }
});

export default router;
