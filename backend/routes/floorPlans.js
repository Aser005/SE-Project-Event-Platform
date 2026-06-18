import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all floor plans for an event
router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const plans = await db.collection('floor_plans')
      .find({ eventId: new ObjectId(req.params.eventId) })
      .toArray();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floor plans' });
  }
});

// Create a new floor plan
router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const { eventId, name, elements } = req.body;
    
    // Check cap
    const count = await db.collection('floor_plans').countDocuments({ eventId: new ObjectId(eventId) });
    if (count >= 5) {
      return res.status(400).json({ error: 'Maximum of 5 layouts allowed per event.' });
    }

    const data = {
      eventId: new ObjectId(eventId),
      organizerId: new ObjectId(req.user.id),
      name: name || `Layout ${count + 1}`,
      elements: elements || [],
      sharedWithStaff: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('floor_plans').insertOne(data);
    res.json({ ...data, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create floor plan' });
  }
});

// Update an existing floor plan
router.put('/:id', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const id = new ObjectId(req.params.id);
    
    await db.collection('floor_plans').updateOne(
      { _id: id },
      { 
        $set: { 
          elements: req.body.elements || [],
          updatedAt: new Date()
        } 
      }
    );

    const plan = await db.collection('floor_plans').findOne({ _id: id });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save floor plan' });
  }
});

// Delete a floor plan
router.delete('/:id', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    await db.collection('floor_plans').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete floor plan' });
  }
});

export default router;
