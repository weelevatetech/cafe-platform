import { Router } from "express";
import Table from "../models/Table.js";
import Booking from "../models/Booking.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tables/availability?date=YYYY-MM-DD&timeSlot=7:00 PM&partySize=4
router.get("/availability", async (req, res) => {
  try {
    const { date, timeSlot, partySize } = req.query;
    if (!date || !timeSlot) {
      return res.status(400).json({ error: "date and timeSlot are required" });
    }

    const allTables = await Table.find(
      partySize ? { capacity: { $gte: Number(partySize) } } : {}
    ).sort({ tableNumber: 1 });

    const bookedTableIds = await Booking.find({
      date,
      timeSlot,
      status: { $in: ["confirmed", "seated"] },
    }).distinct("table");

    const bookedSet = new Set(bookedTableIds.map((id) => id.toString()));
    const available = allTables.filter((t) => !bookedSet.has(t._id.toString()));

    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tables/status?date=YYYY-MM-DD — full grid with current status, for staff view
router.get("/status", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const tables = await Table.find().sort({ tableNumber: 1 });
    const bookings = await Booking.find({ date, status: { $in: ["confirmed", "seated"] } }).populate("table");

    const result = tables.map((t) => {
      const activeBooking = bookings.find((b) => b.table._id.toString() === t._id.toString());
      return {
        ...t.toObject(),
        currentStatus: activeBooking ? activeBooking.status : "available",
        activeBooking: activeBooking || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff: table management
router.post("/", async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
