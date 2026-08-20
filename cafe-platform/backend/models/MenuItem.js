import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Beverages", "Breakfast", "Mains", "Snacks", "Desserts"],
    },
    price: { type: Number, required: true }, // in INR
    description: { type: String, trim: true, default: "" },
    veg: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
