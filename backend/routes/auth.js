import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { signToken, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, profile = {} } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'email, password, name, and role are required' });
    }

    const allowedRoles = ['organizer', 'staff', 'vendor', 'guest', 'venue_owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = getDB();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      profile,
      active: true,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    const token = signToken({ ...user, _id: result.insertedId });
    res.status(201).json({
      token,
      user: { id: result.insertedId, email: user.email, name: user.name, role: user.role, profile: user.profile },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, profile: user.profile },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const db = getDB();
    const update = { updatedAt: new Date() };
    if (name) update.name = name;
    if (profile) update.profile = profile;

    await db.collection('users').updateOne({ _id: new ObjectId(req.user.id) }, { $set: update });
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { passwordHash: 0 } }
    );
    res.json({ ...user, id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/users', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { email, password, name, role, profile = {} } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      profile,
      createdBy: new ObjectId(req.user.id),
      active: true,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ id: result.insertedId, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/users', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const { role, active, speciality, employmentType } = req.query;
    const filter = { createdBy: new ObjectId(req.user.id) };
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    if (speciality) filter['profile.speciality'] = new RegExp(speciality, 'i');
    if (employmentType) filter['profile.employmentType'] = employmentType;

    const db = getDB();
    const users = await db.collection('users')
      .find(filter, { projection: { passwordHash: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/deactivate', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id), createdBy: new ObjectId(req.user.id) },
      { $set: { active: false, deactivatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found or not managed by you' });
    }
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
