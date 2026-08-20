# Brew & Bloom Cafe — Ordering, Booking & Billing Platform

**A sample project by ElevateTech**, built to demonstrate full-stack development capability — not paid client work. Brew & Bloom is a fictional Bangalore cafe used as the case study.

## What it does

**Customer side** — one combined flow:
1. Pick a date, time slot, and party size → see which tables are actually free for that slot
2. Pick a table → browse the menu and pre-order food (optional — can also just book the table and order once seated)
3. Enter contact details → pay online now (mock UPI/Card, generates a transaction ID) or pay at the cafe
4. Get a confirmation with the transaction ID if paid

**Staff side:**
- **Bookings** — see all bookings for a chosen date, move each through `confirmed → seated → completed` (or cancel), filter by date
- **Billing** — for a seated table: edit the order (add items ordered after arrival), see the live total, clear the bill by cash or in-store card/UPI, log a transaction ID, marks the table free again
- **Analytics** — revenue graph (last 14 active days), total revenue, paid order count, average order value, table occupancy %, cancellation rate, and top-selling items

## Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (via Mongoose)

## Project structure
```
cafe-platform/
├── backend/
│   ├── models/
│   │   ├── MenuItem.js
│   │   ├── Table.js
│   │   └── Booking.js       # holds the table booking, pre-ordered items, and payment together
│   ├── routes/
│   │   ├── menu.js
│   │   ├── tables.js         # includes /availability and /status endpoints
│   │   ├── bookings.js       # includes /bill (billing) endpoint
│   │   └── analytics.js      # /revenue and /summary
│   ├── utils/
│   │   ├── timeSlots.js
│   │   ├── payments.js       # mock transaction ID generator — swap for a real gateway later
│   │   └── seed.js           # populates demo menu items + tables
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── CustomerBooking.jsx   # the 4-step customer flow
        │   └── StaffDashboard.jsx
        ├── components/
        │   ├── StaffBookings.jsx
        │   ├── BillingPanel.jsx
        │   └── StaffAnalytics.jsx
        ├── api.js
        └── App.jsx
```

## Running it locally

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI if using Atlas instead of local Mongo
npm run seed               # populates menu items and tables — do this once
npm start
```
Needs a MongoDB instance — local (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Opens at `http://localhost:5173`, talks to the backend at `http://localhost:5000/api` by default (override with `VITE_API_URL`).

## On the "payment" feature

Online payment is **simulated** — there's no real payment gateway wired in, since that needs live API keys. When a customer pays online, the backend generates a mock transaction ID (`utils/payments.js`) exactly where a real gateway's response would go. Swapping in Razorpay (the standard choice for an India-based business) later means replacing that one function — the booking, billing, and analytics flow around it doesn't change.

## API reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/menu` | List available menu items |
| GET | `/api/tables` | List all tables |
| GET | `/api/tables/availability?date=&timeSlot=&partySize=` | Tables free for a given slot |
| GET | `/api/tables/status?date=` | Full table grid with current status (staff view) |
| POST | `/api/bookings` | Create a booking + pre-order (+ optional mock payment) |
| GET | `/api/bookings?date=&status=` | List bookings (staff) |
| PATCH | `/api/bookings/:id/status` | Move booking through confirmed/seated/completed/cancelled |
| PATCH | `/api/bookings/:id/items` | Edit order items (staff, e.g. after seating) |
| POST | `/api/bookings/:id/bill` | Clear the bill — records payment method + transaction ID |
| GET | `/api/analytics/revenue?days=` | Daily revenue series |
| GET | `/api/analytics/summary` | Revenue total, avg order value, top items, occupancy, cancellation rate |

## Notes on scope
Deliberately focused for a demo: no staff login/auth (anyone can open the Staff Dashboard tab), no email/SMS confirmations, no real payment gateway, no menu-item images. All realistic "phase 2" additions for a real client build, not omissions that suggest incomplete work.
