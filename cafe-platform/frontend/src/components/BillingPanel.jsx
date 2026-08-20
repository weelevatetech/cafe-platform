import { useEffect, useState } from "react";
import { api } from "../api";

export default function BillingPanel({ booking, onClose, onBilled }) {
  const [menu, setMenu] = useState([]);
  const [items, setItems] = useState(booking.items.map((i) => ({ ...i })));
  const [method, setMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.getMenu().then(setMenu).catch(() => {}); }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const addItem = (menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem === menuItem._id);
      if (existing) {
        return prev.map((i) => (i.menuItem === menuItem._id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, qty: 1 }];
    });
  };

  const changeQty = (menuItemId, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.menuItem === menuItemId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const saveItems = async () => {
    await api.updateBookingItems(booking._id, items);
  };

  const clearBill = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveItems();
      const finalMethod = method === "cash" ? "cash" : method;
      const finalTxnId = method === "cash" ? (transactionId || undefined) : transactionId || undefined;
      const updated = await api.billBooking(booking._id, finalMethod, finalTxnId);
      onBilled(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ borderColor: "var(--teal)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Billing — Table T{booking.table.tableNumber}</h2>
        <button className="ghost" onClick={onClose}>Close</button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>{booking.customerName} · {booking.partySize} guests · {booking.timeSlot}</p>

      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Order items</h3>
      {items.length === 0 && <p className="empty" style={{ padding: 8 }}>No items yet — add from the menu below.</p>}
      {items.map((i) => (
        <div className="cart-row" key={i.menuItem}>
          <span>{i.name}</span>
          <div className="qty-control">
            <button onClick={() => changeQty(i.menuItem, -1)}>−</button>
            <span className="qty-num">{i.qty}</span>
            <button onClick={() => changeQty(i.menuItem, 1)}>+</button>
            <span style={{ fontFamily: "var(--font-mono)", minWidth: 60, textAlign: "right" }}>₹{i.price * i.qty}</span>
          </div>
        </div>
      ))}
      <div className="cart-total"><span>Total</span><span>₹{total}</span></div>

      <details style={{ marginTop: 16, marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: 13 }}>+ Add item to order</summary>
        <div style={{ marginTop: 10 }}>
          {menu.map((m) => (
            <div className="menu-item" key={m._id}>
              <span className="name">{m.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="price">₹{m.price}</span>
                <button className="ghost" onClick={() => addItem(m)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </details>

      <label>Payment method</label>
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="mock_upi">UPI (in-store)</option>
        <option value="mock_card">Card (in-store)</option>
      </select>

      <label>Transaction ID {method === "cash" ? "(optional)" : "(from payment terminal)"}</label>
      <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder={method === "cash" ? "leave blank to auto-generate a receipt no." : "e.g. UPI ref number"} />

      <button className="primary" disabled={saving} onClick={clearBill} style={{ width: "100%" }}>
        {saving ? "Processing…" : `Clear bill — ₹${total}`}
      </button>
      {error && <p className="status-msg err">{error}</p>}
    </div>
  );
}
