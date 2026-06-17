import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';

import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import bookingRoutes from './routes/bookings.js';
import eventRoutes from './routes/events.js';
import taskRoutes from './routes/tasks.js';
import vendorRoutes from './routes/vendors.js';
import guestRoutes from './routes/guests.js';
import budgetRoutes from './routes/budgets.js';
import messageRoutes from './routes/messages.js';
import feedbackRoutes from './routes/feedback.js';
import invoiceRoutes from './routes/invoices.js';
import floorPlanRoutes from './routes/floorPlans.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/floor-plans', floorPlanRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

await connectDB();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
