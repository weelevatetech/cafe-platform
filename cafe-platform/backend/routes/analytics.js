import { Router } from "express";
import Booking from "../models/Booking.js";
import Table from "../models/Table.js";

const router = Router();

// GET /api/analytics/revenue — daily revenue for the last N days (default 14) from paid bookings
router.get("/revenue", async (req, res) => {
  try {
    const days = Number(req.query.days) || 14;
    const paidBookings = await Booking.find({ "payment.status": "paid" });

    const byDate = {};
    paidBookings.forEach((b) => {
      byDate[b.date] = (byDate[b.date] || 0) + b.itemsTotal;
    });

    const sortedDates = Object.keys(byDate).sort().slice(-days);
    const series = sortedDates.map((date) => ({ date, revenue: byDate[date] }));

    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/summary — top-line business analysis
router.get("/summary", async (req, res) => {
  try {
    const paidBookings = await Booking.find({ "payment.status": "paid" });
    const allBookings = await Booking.find();
    const totalTables = await Table.countDocuments();

    const totalRevenue = paidBookings.reduce((s, b) => s + b.itemsTotal, 0);
    const avgOrderValue = paidBookings.length ? totalRevenue / paidBookings.length : 0;

    // Top selling items
    const itemCounts = {};
    paidBookings.forEach((b) => {
      b.items.forEach((i) => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
      });
    });
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    // Rough occupancy: confirmed/seated/completed bookings vs (tables x distinct date-slot combos seen)
    const activeStatuses = ["confirmed", "seated", "completed"];
    const activeBookings = allBookings.filter((b) => activeStatuses.includes(b.status));
    const distinctSlots = new Set(activeBookings.map((b) => `${b.date}|${b.timeSlot}`)).size;
    const maxPossible = totalTables * Math.max(distinctSlots, 1);
    const occupancyPct = maxPossible ? Math.round((activeBookings.length / maxPossible) * 100) : 0;

    const cancelledCount = allBookings.filter((b) => b.status === "cancelled").length;
    const cancellationRate = allBookings.length ? Math.round((cancelledCount / allBookings.length) * 100) : 0;

    res.json({
      totalRevenue,
      totalPaidOrders: paidBookings.length,
      avgOrderValue: Math.round(avgOrderValue),
      topItems,
      occupancyPct,
      cancellationRate,
      totalBookings: allBookings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
