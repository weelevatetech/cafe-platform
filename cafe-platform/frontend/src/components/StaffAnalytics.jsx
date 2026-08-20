import { useEffect, useState } from "react";
import { api } from "../api";

export default function StaffAnalytics() {
  const [revenue, setRevenue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getRevenue(14), api.getSummary()])
      .then(([r, s]) => { setRevenue(r); setSummary(s); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading analytics…</div>;
  if (error) return <div className="card status-msg err">Couldn't load analytics: {error}</div>;

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1);

  return (
    <>
      <div className="card">
        <h2>Business Overview</h2>
        <div className="stats-row">
          <div className="stat"><div className="num">₹{summary.totalRevenue.toLocaleString()}</div><div className="label">Total revenue</div></div>
          <div className="stat"><div className="num">{summary.totalPaidOrders}</div><div className="label">Paid orders</div></div>
          <div className="stat"><div className="num">₹{summary.avgOrderValue}</div><div className="label">Avg order value</div></div>
          <div className="stat"><div className="num">{summary.occupancyPct}%</div><div className="label">Table occupancy</div></div>
          <div className="stat"><div className="num">{summary.cancellationRate}%</div><div className="label">Cancellation rate</div></div>
        </div>
      </div>

      <div className="card">
        <h2>Revenue — Last {revenue.length} Active Days</h2>
        {revenue.length === 0 ? (
          <p className="empty">No paid orders yet — the revenue graph fills in as bills get cleared.</p>
        ) : (
          <div className="bar-chart">
            {revenue.map((r) => (
              <div className="bar-wrap" key={r.date}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)", marginBottom: 4 }}>
                  ₹{r.revenue >= 1000 ? `${(r.revenue / 1000).toFixed(1)}k` : r.revenue}
                </div>
                <div className="bar" style={{ height: `${(r.revenue / maxRevenue) * 100}%` }}></div>
                <div className="bar-label">{r.date.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Top Selling Items</h2>
        {summary.topItems.length === 0 ? (
          <p className="empty">No sales data yet.</p>
        ) : (
          <table>
            <thead><tr><th>Item</th><th>Qty sold</th></tr></thead>
            <tbody>
              {summary.topItems.map((i) => (
                <tr key={i.name}><td>{i.name}</td><td>{i.qty}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
