const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getMenu: () => request("/menu"),
  getTables: () => request("/tables"),
  getAvailability: (date, timeSlot, partySize) =>
    request(`/tables/availability?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}&partySize=${partySize}`),
  getTableStatus: (date) => request(`/tables/status?date=${date}`),

  createBooking: (data) => request("/bookings", { method: "POST", body: JSON.stringify(data) }),
  listBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bookings${qs ? `?${qs}` : ""}`);
  },
  updateBookingStatus: (id, status) =>
    request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateBookingItems: (id, items) =>
    request(`/bookings/${id}/items`, { method: "PATCH", body: JSON.stringify({ items }) }),
  billBooking: (id, method, transactionId) =>
    request(`/bookings/${id}/bill`, { method: "POST", body: JSON.stringify({ method, transactionId }) }),

  getRevenue: (days = 14) => request(`/analytics/revenue?days=${days}`),
  getSummary: () => request("/analytics/summary"),
};
