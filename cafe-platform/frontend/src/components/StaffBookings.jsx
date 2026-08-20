import { useEffect, useState } from "react";
import { api } from "../api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_FLOW = { confirmed: "seated", seated: "completed" };

export default function StaffBookings({ onBillBooking }) {
  const [date, setDate] = useState(todayStr());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listBookings({ date });
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date]);

  const advanceStatus = async (booking) => {
    const next = STATUS_FLOW[booking.status];
    if (!next) return;
    await api.updateBookingStatus(booking._id, next);
    load();
  };

  const cancelBooking = async (booking) => {
    if (!confirm("Cancel this booking?")) return;
    await api.updateBookingStatus(booking._id, "cancelled");
    load();
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h2 style={{ marginBottom: 0 }}>Bookings</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ marginBottom: 0 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginBottom: 0, width: "auto" }} />
        </div>
      </div>

      {loading && <p className="empty">Loading…</p>}
      {error && <p className="status-msg err">{error}</p>}
      {!loading && bookings.length === 0 && <p className="empty">No bookings for this date.</p>}

      {!loading && bookings.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Table</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Party</th>
              <th>Order total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>T{b.table?.tableNumber}</td>
                <td>{b.timeSlot}</td>
                <td>{b.customerName}<div style={{ color: "var(--text-muted)", fontSize: 12 }}>{b.phone}</div></td>
                <td>{b.partySize}</td>
                <td>₹{b.itemsTotal}</td>
                <td><span className={`badge ${b.payment.status}`}>{b.payment.status}</span></td>
                <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {STATUS_FLOW[b.status] && (
                    <button className="ghost" style={{ marginRight: 6 }} onClick={() => advanceStatus(b)}>
                      Mark {STATUS_FLOW[b.status]}
                    </button>
                  )}
                  {b.status !== "completed" && b.status !== "cancelled" && (
                    <button className="ghost" onClick={() => cancelBooking(b)}>Cancel</button>
                  )}
                  {b.status === "seated" && b.payment.status === "unpaid" && (
                    <button className="primary" style={{ marginLeft: 6 }} onClick={() => onBillBooking(b)}>Bill</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
