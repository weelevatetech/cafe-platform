import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    location: { type: String, default: "Main Floor" }, // e.g. "Patio", "Main Floor"
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
