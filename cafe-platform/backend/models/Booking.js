import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true }, // snapshot at time of order
    price: { type: Number, required: true }, // snapshot at time of order
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },

    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    timeSlot: { type: String, required: true }, // e.g. "7:00 PM"
    partySize: { type: Number, required: true },

    items: { type: [orderItemSchema], default: [] },
    itemsTotal: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["confirmed", "seated", "completed", "cancelled"],
      default: "confirmed",
    },

    payment: {
      status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
      method: { type: String, enum: ["mock_upi", "mock_card", "cash", "none"], default: "none" },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ table: 1, date: 1, timeSlot: 1 });

export default mongoose.model("Booking", bookingSchema);
