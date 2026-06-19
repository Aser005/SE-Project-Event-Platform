# Event Management Platform

Full-stack web application for managing events end-to-end — from venue booking to post-event reporting. Built for the GUC Full-Stack Application project (Milestone 2 User Journeys).

## Team Members

| Name | ID | Contributions |
|------|----|---------------|
| Hamza Ahmed El sheikh | 22001246 | _Describe commits_ |
| Ali Mohamed | 19002054 | _Describe commits_ |
| Aser Elserwee | 19002064 | _Describe commits_ |
| Menoub Osama | 22001268 | _Describe commits_ |
| Abdelraham Emad | 22001314 | _Describe commits_ |

## Technologies

- **Frontend:** React 19 + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT tokens

## Project Structure

```
TravelApp/
├── backend/          # Node.js REST API
│   ├── routes/       # API endpoints by domain
│   ├── scripts/      # Database seed script
│   └── server.js
├── frontend/         # React SPA
│   └── src/
│       ├── pages/    # Role-based pages
│       └── api/      # API client
└── README.md
```

> Note: The root-level Express/EJS travel app is an older unrelated project. The course submission lives in `backend/` and `frontend/`.

## Prerequisites

1. **Node.js 18+** — [Download](https://nodejs.org/)
2. **MongoDB** — [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (free tier)

## Setup Instructions

### 1. Install MongoDB

**Local (Windows):**
- Install MongoDB Community Server
- Start the service: MongoDB should run on `mongodb://localhost:27017`

**Or use MongoDB Atlas:**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Copy your connection string into `backend/.env`

### 2. Backend Setup

```powershell
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

The API runs at **http://localhost:5000**

### 3. Frontend Setup

Open a **second terminal**:

```powershell
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**

## Demo Accounts

After running `npm run seed`, use these accounts (password: `password123`):

| Email | Role |
|-------|------|
| organizer@demo.com | Event Organizer |
| staff@demo.com | Staff Member |
| vendor@demo.com | Vendor |
| guest@demo.com | Guest |
| venue@demo.com | Venue Owner |

## Implemented User Journeys

### Event Organizer (Journeys 1–7)
- [x] Register/login and update profile (`/register`, `/organizer/profile`)
- [x] Create/deactivate staff, guest, and vendor accounts (`/organizer/accounts`)
- [x] Browse/search/filter venues (city, capacity, m², amenity, date) and submit bookings
- [x] Daily dashboard with events, guest stats, feedback stats, tasks due
- [x] Task management — create, assign, filter staff by speciality/employment type
- [x] Budget — edit planned total, track expenses, view variance
- [x] Floor plan designer with drag-and-drop and PNG export (`/organizer/floor-plan`)
- [x] Guest management — add guests, filter by RSVP/dietary, bulk invitations
- [x] Vendor sourcing, delivery tracking, invoice review
- [x] Day-of ops — messaging, seen status, follow-ups
- [x] Post-event reports and feedback (JSON export)

### Staff (Journeys 8–12)
- [x] Login with organizer-provided credentials
- [x] View assigned events and tasks; update task status
- [x] View shared floor plan
- [x] Guest check-in by name or QR code entry
- [x] Mark vendor arrivals
- [x] Day-of dashboard

### Vendor (Journeys 13–16)
- [x] Register/login and profile management
- [x] Accept/decline sourcing requests with clarification messages
- [x] Update delivery status with delay notes
- [x] Submit invoices with line items and attachment notes

### Guest (Journeys 17–21)
- [x] View invitations and event details
- [x] RSVP with custom dietary preferences and special requirements
- [x] View day-of messages and mark as seen
- [x] QR check-in pass (`/guest/check-in`)
- [x] Submit post-event feedback (auto-linked to invitations)

### Venue Owner (Journeys 22–26)
- [x] Register/login and profile management
- [x] Create/edit/deactivate listings; mark unavailable dates
- [x] Approve/decline bookings with counter-proposals
- [x] Confirmed bookings with date/venue filters and organizer contact
- [x] Performance analytics dashboard with per-listing revenue and export

## Assumptions

- Email/SMS invitations are simulated in-app (no real SMTP); "Send Invite" marks the invitation as sent in the database.
- QR codes are generated for guest check-in passes; staff scan by entering the code (no physical scanner hardware).
- Floor plan exports as PNG; reports export as JSON (PDF export can be added later).
- Vendor invoice attachments are text notes, not file uploads.
- Push/email notifications and automated task reminders are represented by in-app dashboards and reminder banners.

## Dummy Data

The seed script (`backend/scripts/seed.js`) generates:
- 6 users (one per role + extra staff)
- 3 venues in Cairo/Alexandria
- 3 events (today, past, upcoming)
- Guests, tasks, budget, sourcing requests, invoices, messages, feedback, floor plan

Re-seed anytime:
```powershell
cd backend
npm run seed
```

## How to Finish the Project (Team Roadmap)

### Week 1 — Polish & GitHub
1. Create team GitHub repo and push `backend/` + `frontend/`
2. Each member picks a role's pages and makes meaningful commits
3. Add team names to this README
4. Test all 5 demo logins end-to-end

### Week 2 — Enhancements (pick based on team size)
| Priority | Task | Journey |
|----------|------|---------|
| High | Organizer: create/deactivate team member UI | 1 |
| High | Venue: availability calendar UI | 23 |
| High | Guest: auto-fill event ID on feedback page | 21 |
| Medium | Floor plan: export as PNG (html2canvas) | 3 |
| Medium | Real email via Nodemailer (optional) | 17 |
| Medium | PDF report export (pdfkit) | 7, 26 |
| Low | QR code generation for guest check-in | 20 |
| Low | Mobile-responsive CSS pass | All |

### Before Submission (June 18, 2026)
- [ ] All demo accounts work
- [ ] `npm run seed` populates database
- [ ] README has team names and setup steps
- [ ] Each member has ≥1 meaningful commit
- [ ] Walk through all 26 journeys in a demo rehearsal

## API Endpoints (Quick Reference)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/venues | Search venues |
| POST | /api/bookings | Submit booking |
| GET | /api/events/dashboard/today | Organizer/staff dashboard |
| GET/POST | /api/tasks | Task management |
| GET/POST | /api/guests | Guest management |
| GET/PUT | /api/budgets/:eventId | Budget |
| GET/PUT | /api/floor-plans/:eventId | Floor plan |
| GET/POST | /api/messages | Day-of communications |
| GET/POST | /api/feedback | Post-event feedback |
| GET/POST | /api/invoices | Vendor invoicing |

## Troubleshooting

**"node is not recognized"** — Install Node.js from nodejs.org and restart your terminal.

**MongoDB connection failed** — Ensure MongoDB is running locally, or update `MONGODB_URI` in `backend/.env`.

**CORS errors** — Backend must run on port 5000; frontend on 5173. Check `FRONTEND_URL` in `.env`.

**Empty pages after login** — Run `npm run seed` in the backend folder first.
