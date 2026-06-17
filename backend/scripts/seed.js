import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'event_platform';

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  console.log('Clearing existing data...');
  const collections = [
    'users', 'venues', 'bookings', 'events', 'tasks', 'guests',
    'budgets', 'sourcing_requests', 'invoices', 'messages', 'feedback', 'floor_plans',
  ];
  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const organizerId = new ObjectId();
  const staffId = new ObjectId();
  const vendorId = new ObjectId();
  const guestUserId = new ObjectId();
  const venueOwnerId = new ObjectId();

  const users = [
    {
      _id: organizerId,
      email: 'organizer@demo.com',
      passwordHash,
      name: 'Sarah Hassan',
      role: 'organizer',
      profile: { company: 'Cairo Events Co.', phone: '+20 100 123 4567' },
      active: true,
      createdAt: new Date(),
    },
    {
      _id: staffId,
      email: 'staff@demo.com',
      passwordHash,
      name: 'Ahmed Mahmoud',
      role: 'staff',
      profile: { speciality: 'Logistics', employmentType: 'full-time', age: 28 },
      createdBy: organizerId,
      active: true,
      createdAt: new Date(),
    },
    {
      _id: new ObjectId(),
      email: 'staff2@demo.com',
      passwordHash,
      name: 'Mona El-Sayed',
      role: 'staff',
      profile: { speciality: 'Catering', employmentType: 'part-time', age: 24 },
      createdBy: organizerId,
      active: true,
      createdAt: new Date(),
    },
    {
      _id: vendorId,
      email: 'vendor@demo.com',
      passwordHash,
      name: 'Fresh Catering Egypt',
      role: 'vendor',
      profile: {
        companyName: 'Fresh Catering Egypt',
        supplies: 'Catering, Beverages, Tableware',
        location: 'Cairo, Egypt',
        pricingList: [
          { item: 'Buffet per person', price: 350 },
          { item: 'Coffee station', price: 5000 },
        ],
        contact: '+20 122 987 6543',
      },
      active: true,
      createdAt: new Date(),
    },
    {
      _id: guestUserId,
      email: 'guest@demo.com',
      passwordHash,
      name: 'Omar Farouk',
      role: 'guest',
      profile: { dietaryPreference: 'Vegetarian' },
      active: true,
      createdAt: new Date(),
    },
    {
      _id: venueOwnerId,
      email: 'venue@demo.com',
      passwordHash,
      name: 'Nadia Kamal',
      role: 'venue_owner',
      profile: { companyName: 'Nile View Venues', phone: '+20 111 555 7890' },
      active: true,
      createdAt: new Date(),
    },
  ];

  await db.collection('users').insertMany(users);
  console.log('Seeded users');

  const venueIds = [new ObjectId(), new ObjectId(), new ObjectId()];
  const venues = [
    {
      _id: venueIds[0],
      ownerId: venueOwnerId,
      name: 'Garden Terrace Zamalek',
      description: 'Elegant outdoor terrace overlooking the Nile, perfect for corporate events and weddings.',
      location: { city: 'Cairo', area: 'Zamalek', address: '26th July Street' },
      capacity: 200,
      dimensions: 350,
      amenities: ['WiFi', 'AV Equipment', 'Parking', 'Catering Kitchen'],
      pricing: { hourly: 5000, daily: 35000 },
      photos: [],
      active: true,
      unavailableDates: [nextWeek],
      createdAt: new Date(),
    },
    {
      _id: venueIds[1],
      ownerId: venueOwnerId,
      name: 'Downtown Loft New Cairo',
      description: 'Modern industrial loft space ideal for product launches and pop-up exhibitions.',
      location: { city: 'Cairo', area: 'New Cairo', address: '90th Street' },
      capacity: 120,
      dimensions: 200,
      amenities: ['WiFi', 'Projector', 'Stage'],
      pricing: { hourly: 3500, daily: 25000 },
      photos: [],
      active: true,
      unavailableDates: [],
      createdAt: new Date(),
    },
    {
      _id: venueIds[2],
      ownerId: venueOwnerId,
      name: 'Alexandria Seaside Pavilion',
      description: 'Beachfront pavilion for summer events with panoramic Mediterranean views.',
      location: { city: 'Alexandria', area: 'Montaza', address: 'Corniche Road' },
      capacity: 300,
      dimensions: 500,
      amenities: ['WiFi', 'Outdoor Seating', 'Sound System'],
      pricing: { hourly: 7000, daily: 50000 },
      photos: [],
      active: true,
      unavailableDates: [],
      createdAt: new Date(),
    },
  ];
  await db.collection('venues').insertMany(venues);
  console.log('Seeded venues');

  const eventId = new ObjectId();
  const pastEventId = new ObjectId();

  const events = [
    {
      _id: eventId,
      organizerId,
      venueId: venueIds[0],
      name: 'Tech Innovation Summit 2026',
      date: today,
      time: '18:00',
      type: 'Conference',
      expectedAttendees: 150,
      dressCode: 'Business casual',
      agenda: 'Keynotes, networking, product demos',
      status: 'active',
      staffIds: [staffId],
      createdAt: new Date(),
    },
    {
      _id: pastEventId,
      organizerId,
      venueId: venueIds[1],
      name: 'Spring Product Launch',
      date: '2026-05-20',
      time: '19:00',
      type: 'Product Launch',
      expectedAttendees: 80,
      status: 'completed',
      staffIds: [staffId],
      createdAt: new Date(),
    },
    {
      _id: new ObjectId(),
      organizerId,
      venueId: venueIds[2],
      name: 'Charity Gala Dinner',
      date: nextWeek,
      time: '20:00',
      type: 'Gala',
      expectedAttendees: 200,
      status: 'planning',
      staffIds: [staffId],
      createdAt: new Date(),
    },
  ];
  await db.collection('events').insertMany(events);
  console.log('Seeded events');

  await db.collection('bookings').insertMany([
    {
      venueId: venueIds[0],
      organizerId,
      organizerName: 'Sarah Hassan',
      eventType: 'Conference',
      date: today,
      expectedAttendees: 150,
      status: 'approved',
      createdAt: new Date(),
    },
    {
      venueId: venueIds[1],
      organizerId,
      organizerName: 'Sarah Hassan',
      eventType: 'Product Launch',
      date: tomorrow,
      expectedAttendees: 80,
      status: 'pending',
      createdAt: new Date(),
    },
  ]);

  const guestIds = [new ObjectId(), new ObjectId(), new ObjectId()];
  await db.collection('guests').insertMany([
    {
      _id: guestIds[0],
      eventId,
      organizerId,
      userId: guestUserId,
      name: 'Omar Farouk',
      email: 'guest@demo.com',
      rsvpStatus: 'attending',
      dietaryPreferences: 'Vegetarian',
      checkInStatus: 'not_arrived',
      invitationSent: true,
      invitedAt: new Date(),
      checkInCode: 'EVT-DEMO001',
    },
    {
      _id: guestIds[1],
      eventId,
      organizerId,
      name: 'Layla Ibrahim',
      email: 'layla@example.com',
      rsvpStatus: 'attending',
      dietaryPreferences: 'None',
      checkInStatus: 'arrived',
      invitationSent: true,
      checkInCode: 'EVT-DEMO002',
    },
    {
      _id: guestIds[2],
      eventId,
      organizerId,
      name: 'Youssef Ali',
      email: 'youssef@example.com',
      rsvpStatus: 'maybe',
      checkInStatus: 'not_arrived',
      invitationSent: true,
      checkInCode: 'EVT-DEMO003',
    },
  ]);

  await db.collection('tasks').insertMany([
    {
      eventId,
      organizerId,
      title: 'Set up registration desk',
      description: 'Prepare welcome desk with badges and QR scanner',
      category: 'Logistics',
      status: 'in_progress',
      assignedTo: staffId,
      dueDate: today,
      createdAt: new Date(),
    },
    {
      eventId,
      organizerId,
      title: 'Arrange catering stations',
      category: 'Catering',
      status: 'pending',
      assignedTo: null,
      dueDate: today,
      createdAt: new Date(),
    },
    {
      eventId,
      organizerId,
      title: 'Test AV equipment',
      category: 'Logistics',
      status: 'done',
      assignedTo: staffId,
      dueDate: today,
      createdAt: new Date(),
    },
  ]);

  await db.collection('budgets').insertOne({
    eventId,
    organizerId,
    plannedTotal: 150000,
    breakdown: [
      { category: 'Venue', planned: 35000 },
      { category: 'Catering', planned: 60000 },
      { category: 'Marketing', planned: 20000 },
      { category: 'Staff', planned: 35000 },
    ],
    actualExpenses: [
      { id: '1', category: 'Venue', description: 'Deposit payment', amount: 17500, recordedAt: new Date() },
      { id: '2', category: 'Catering', description: 'Vendor deposit', amount: 30000, recordedAt: new Date() },
    ],
    createdAt: new Date(),
  });

  const sourcingRequestId = new ObjectId();
  await db.collection('sourcing_requests').insertMany([
    {
      _id: sourcingRequestId,
      eventId,
      vendorId,
      organizerId,
      items: [{ name: 'Buffet dinner', quantity: 150 }, { name: 'Coffee station', quantity: 1 }],
      deliveryDate: today,
      eventLocation: 'Garden Terrace Zamalek, Cairo',
      status: 'accepted',
      deliveryStatus: 'preparing',
      createdAt: new Date(),
    },
  ]);

  await db.collection('invoices').insertOne({
    eventId,
    vendorId,
    organizerId,
    amount: 52500,
    lineItems: [
      { item: 'Buffet x150', amount: 52500 },
    ],
    status: 'pending_review',
    submittedAt: new Date(),
  });

  await db.collection('messages').insertMany([
    {
      eventId,
      guestId: guestIds[0],
      organizerId,
      subject: 'Welcome to Tech Innovation Summit',
      body: 'Doors open at 5:30 PM. Please use Entrance B.',
      type: 'day_of',
      status: 'sent',
      seen: false,
      sentAt: new Date(),
    },
    {
      eventId,
      guestId: guestIds[1],
      organizerId,
      subject: 'Welcome to Tech Innovation Summit',
      body: 'Doors open at 5:30 PM. Please use Entrance B.',
      type: 'day_of',
      status: 'sent',
      seen: true,
      sentAt: new Date(),
      seenAt: new Date(),
    },
  ]);

  await db.collection('feedback').insertMany([
    {
      eventId: pastEventId,
      organizerId,
      guestId: guestUserId,
      guestName: 'Omar Farouk',
      overallRating: 5,
      foodRating: 4,
      venueRating: 5,
      organizationRating: 4,
      comments: 'Great event, well organized!',
      submittedAt: new Date(),
    },
    {
      eventId: pastEventId,
      organizerId,
      guestName: 'Anonymous Guest',
      overallRating: 2,
      foodRating: 2,
      venueRating: 3,
      organizationRating: 2,
      comments: 'Long wait times at registration.',
      submittedAt: new Date(),
    },
  ]);

  await db.collection('floor_plans').insertOne({
    eventId,
    organizerId,
    sharedWithStaff: true,
    elements: [
      { id: '1', type: 'stage', x: 100, y: 50, width: 200, height: 60, label: 'Main Stage' },
      { id: '2', type: 'table', x: 80, y: 180, width: 80, height: 80, label: 'Table 1' },
      { id: '3', type: 'table', x: 200, y: 180, width: 80, height: 80, label: 'Table 2' },
      { id: '4', type: 'entrance', x: 20, y: 300, width: 60, height: 40, label: 'Entrance B' },
    ],
    createdAt: new Date(),
  });

  console.log('\nSeed complete! Demo accounts (password: password123):');
  console.log('  organizer@demo.com  - Event Organizer');
  console.log('  staff@demo.com      - Staff Member');
  console.log('  vendor@demo.com     - Vendor');
  console.log('  guest@demo.com      - Guest');
  console.log('  venue@demo.com      - Venue Owner');

  await client.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
