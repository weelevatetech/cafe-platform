import { useEffect, useState } from "react";
import { api } from "../api";

const TIME_SLOTS = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CustomerBooking() {
  const [step, setStep] = useState(1);

  // Step 1: date/time/party
  const [date, setDate] = useState(todayStr());
  const [timeSlot, setTimeSlot] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Step 2: menu + cart
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); // menuItemId -> qty

  // Step 3: contact + payment
  const [contact, setContact] = useState({ customerName: "", phone: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState("mock_upi");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    api.getMenu().then(setMenu).catch(() => {});
  }, []);

  const checkAvailability = async () => {
    if (!timeSlot) return;
    setCheckingAvailability(true);
    setError(null);
    try {
      const tables = await api.getAvailability(date, timeSlot, partySize);
      setAvailableTables(tables);
      setSelectedTable(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = menu.find((m) => m._id === id);
      return item ? { menuItem: id, name: item.name, price: item.price, qty } : null;
    })
    .filter(Boolean);

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const setQty = (id, delta) => {
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));
  };

  const handleConfirmBooking = async (payNow) => {
    setSubmitting(true);
    setError(null);
    try {
      const booking = await api.createBooking({
        ...contact,
        table: selectedTable._id,
        date,
        timeSlot,
        partySize,
        items: cartItems,
        payNow,
        paymentMethod,
      });
      setConfirmedBooking(booking);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Step 4: confirmation ----
  if (step === 4 && confirmedBooking) {
    return (
      <div className="card confirmation">
        <h2>Booking confirmed 🎉</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          Table {confirmedBooking.table.tableNumber} · {confirmedBooking.date} · {confirmedBooking.timeSlot} · {confirmedBooking.partySize} guests
        </p>
        {confirmedBooking.payment.status === "paid" ? (
          <>
            <p style={{ marginTop: 16 }}>Payment received.</p>
            <div className="txn">TXN ID: {confirmedBooking.payment.transactionId}</div>
          </>
        ) : (
          <p style={{ marginTop: 16, color: "var(--amber)" }}>Pay at the cafe when you arrive.</p>
        )}
        <div style={{ marginTop: 24 }}>
          <button className="ghost" onClick={() => window.location.reload()}>Make another booking</button>
        </div>
      </div>
    );
  }

  // ---- Step 3: contact + payment ----
  if (step === 3) {
    return (
      <div className="card">
        <h2>3. Your details & payment</h2>
        <div className="grid-2">
          <div>
            <label>Full name</label>
            <input value={contact.customerName} onChange={(e) => setContact({ ...contact, customerName: e.target.value })} />
          </div>
          <div>
            <label>Phone</label>
            <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          </div>
        </div>
        <label>Email (optional)</label>
        <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />

        <div className="card" style={{ background: "var(--surface-2)", marginTop: 4, marginBottom: 16 }}>
          <div className="cart-row"><span>Table T{selectedTable.tableNumber}</span><span>{date} · {timeSlot}</span></div>
          {cartItems.map((i) => (
            <div className="cart-row" key={i.menuItem}><span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span></div>
          ))}
          {cartItems.length === 0 && <p className="empty" style={{ padding: 8 }}>No items pre-ordered — you can order once seated.</p>}
          <div className="cart-total"><span>Total</span><span>₹{cartTotal}</span></div>
        </div>

        {cartTotal > 0 && (
          <>
            <label>Payment method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="mock_upi">UPI</option>
              <option value="mock_card">Card</option>
            </select>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <button className="ghost" onClick={() => setStep(2)}>← Back to menu</button>
          {cartTotal > 0 && (
            <button className="primary" disabled={submitting || !contact.customerName || !contact.phone} onClick={() => handleConfirmBooking(true)}>
              {submitting ? "Processing…" : `Pay ₹${cartTotal} & confirm`}
            </button>
          )}
          <button className="ghost" disabled={submitting || !contact.customerName || !contact.phone} onClick={() => handleConfirmBooking(false)}>
            {cartTotal > 0 ? "Confirm & pay at cafe instead" : "Confirm booking"}
          </button>
        </div>
        {error && <p className="status-msg err">{error}</p>}
      </div>
    );
  }

  // ---- Step 2: menu + cart ----
  if (step === 2) {
    const categories = [...new Set(menu.map((m) => m.category))];
    return (
      <>
        <div className="card">
          <h2>2. Pre-order (optional)</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Table T{selectedTable.tableNumber} · {date} · {timeSlot} · {partySize} guests</p>
          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, color: "var(--teal)", marginBottom: 6 }}>{cat}</h3>
              {menu.filter((m) => m.category === cat).map((item) => (
                <div className="menu-item" key={item._id}>
                  <div>
                    <div className="name"><span className={`veg-dot ${item.veg ? "veg" : "nonveg"}`}></span>{item.name}</div>
                    {item.description && <div className="desc">{item.description}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="price">₹{item.price}</span>
                    <div className="qty-control">
                      <button onClick={() => setQty(item._id, -1)}>−</button>
                      <span className="qty-num">{cart[item._id] || 0}</span>
                      <button onClick={() => setQty(item._id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <button className="ghost" onClick={() => setStep(1)}>← Back</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>Cart total: ₹{cartTotal}</span>
            <button className="primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      </>
    );
  }

  // ---- Step 1: date/time/party/table ----
  return (
    <div className="card">
      <h2>1. Pick a date, time & party size</h2>
      <div className="grid-3">
        <div>
          <label>Date</label>
          <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>Party size</label>
          <input type="number" min="1" max="12" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} />
        </div>
        <div>
          <label>&nbsp;</label>
          <button className="primary" onClick={checkAvailability} disabled={!timeSlot || checkingAvailability} style={{ width: "100%" }}>
            {checkingAvailability ? "Checking…" : "Check availability"}
          </button>
        </div>
      </div>
      <label>Time slot</label>
      <div className="slot-grid">
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot}
            className={`slot-btn ${timeSlot === slot ? "active" : ""}`}
            onClick={() => { setTimeSlot(slot); setAvailableTables([]); setSelectedTable(null); }}
          >
            {slot}
          </div>
        ))}
      </div>

      {availableTables.length > 0 && (
        <>
          <label style={{ marginTop: 10 }}>Available tables</label>
          <div className="table-grid">
            {availableTables.map((t) => (
              <div
                key={t._id}
                className={`table-card ${selectedTable?._id === t._id ? "selected" : ""}`}
                onClick={() => setSelectedTable(t)}
              >
                <div className="tnum">T{t.tableNumber}</div>
                <div className="tcap">Seats {t.capacity}</div>
                <div className="tloc">{t.location}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {timeSlot && availableTables.length === 0 && !checkingAvailability && (
        <p className="empty">Click "Check availability" to see open tables for this slot.</p>
      )}
      {error && <p className="status-msg err">{error}</p>}

      {selectedTable && (
        <button className="primary" style={{ marginTop: 12 }} onClick={() => setStep(2)}>
          Continue to menu →
        </button>
      )}
    </div>
  );
}
