import { useState } from "react";
import CustomerBooking from "./pages/CustomerBooking";
import StaffDashboard from "./pages/StaffDashboard";

export default function App() {
  const [tab, setTab] = useState("customer");

  return (
    <div className="app">
      <header className="top">
        <div className="brand">Brew & <span>Bloom</span></div>
        <div className="tabs">
          <button className={tab === "customer" ? "active" : ""} onClick={() => setTab("customer")}>
            Book a Table
          </button>
          <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>
            Staff Dashboard
          </button>
        </div>
      </header>

      {tab === "customer" ? <CustomerBooking /> : <StaffDashboard />}
    </div>
  );
}
