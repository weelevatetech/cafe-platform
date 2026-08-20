import { Router } from "express";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";
import { generateMockTransactionId, calcItemsTotal } from "../utils/payments.js";

const router = Router();

// POST /api/bookings — customer flow: book table + pre-order + (optional) mock pay now
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, email, table, date, timeSlot, partySize, items = [], payNow, paymentMethod } = req.body;

    if (!customerName || !phone || !table || !date || !timeSlot || !partySize) {
      return res.status(400).json({ error: "Missing required booking details" });
    }

    // Re-check availability at write time to avoid double-booking a table/slot
    const conflict = await Booking.findOne({
      table, date, timeSlot, status: { $in: ["confirmed", "seated"] },
    });
    if (conflict) {
      return res.status(409).json({ error: "That table is no longer available for the selected time" });
    }

    const itemsTotal = calcItemsTotal(items);

    const payment = { status: "unpaid", method: "none", transactionId: null, paidAt: null };
    if (payNow && itemsTotal > 0) {
      payment.status = "paid";
      payment.method = paymentMethod === "mock_card" ? "mock_card" : "mock_upi";
      payment.transactionId = generateMockTransactionId();
      payment.paidAt = new Date();
    }

    const booking = await Booking.create({
      customerName, phone, email, table, date, timeSlot, partySize,
      items, itemsTotal, payment,
    });

    const populated = await booking.populate("table");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/bookings?date=&status= — staff view
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter).populate("table").sort({ date: 1, timeSlot: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status — confirmed -> seated -> completed, or cancelled
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate("table");
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/items — staff adds/edits order items after seating
router.patch("/:id/items", async (req, res) => {
  try {
    const { items } = req.body;
    const itemsTotal = calcItemsTotal(items);
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { items, itemsTotal },
      { new: true, runValidators: true }
    ).populate("table");
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/bookings/:id/bill — staff clears the bill: records payment method + transaction ID, marks paid
router.post("/:id/bill", async (req, res) => {
  try {
    const { method, transactionId } = req.body; // e.g. method: "cash" | "mock_upi" | "mock_card"
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.payment.status = "paid";
    booking.payment.method = method || "cash";
    booking.payment.transactionId = transactionId || generateMockTransactionId("CASH");
    booking.payment.paidAt = new Date();
    booking.status = "completed";

    await booking.save();
    const populated = await booking.populate("table");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
