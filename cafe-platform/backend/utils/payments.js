// Simulates what a real payment gateway (Razorpay, etc.) would return.
// Swap this out for a real gateway call when going to production —
// the rest of the booking/billing flow doesn't need to change.
export function generateMockTransactionId(prefix = "TXN") {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `${prefix}-${ts}-${rand}`;
}

export function calcItemsTotal(items = []) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
