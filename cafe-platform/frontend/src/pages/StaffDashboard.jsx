import { useState } from "react";
import StaffBookings from "../components/StaffBookings";
import BillingPanel from "../components/BillingPanel";
import StaffAnalytics from "../components/StaffAnalytics";

export default function StaffDashboard() {
  const [subTab, setSubTab] = useState("bookings");
  const [billingBooking, setBillingBooking] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBilled = () => {
    setBillingBooking(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <div className="tabs" style={{ marginBottom: 20, display: "inline-flex" }}>
        <button className={subTab === "bookings" ? "active" : ""} onClick={() => setSubTab("bookings")}>Bookings</button>
        <button className={subTab === "analytics" ? "active" : ""} onClick={() => setSubTab("analytics")}>Analytics</button>
      </div>

      {billingBooking ? (
        <BillingPanel booking={billingBooking} onClose={() => setBillingBooking(null)} onBilled={handleBilled} />
      ) : subTab === "bookings" ? (
        <StaffBookings key={refreshKey} onBillBooking={setBillingBooking} />
      ) : (
        <StaffAnalytics key={refreshKey} />
      )}
    </>
  );
}
