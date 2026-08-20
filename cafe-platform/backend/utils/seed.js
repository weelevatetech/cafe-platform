import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brewandbloom-cafe";

const menuItems = [
  { name: "Filter Coffee", category: "Beverages", price: 80, veg: true, description: "South Indian filter coffee" },
  { name: "Cappuccino", category: "Beverages", price: 140, veg: true, description: "" },
  { name: "Masala Chai", category: "Beverages", price: 60, veg: true, description: "" },
  { name: "Cold Brew", category: "Beverages", price: 160, veg: true, description: "" },
  { name: "Avocado Toast", category: "Breakfast", price: 220, veg: true, description: "Sourdough, smashed avocado, chilli flakes" },
  { name: "Masala Omelette", category: "Breakfast", price: 150, veg: false, description: "" },
  { name: "Paneer Butter Masala Bowl", category: "Mains", price: 280, veg: true, description: "With jeera rice" },
  { name: "Grilled Chicken Sandwich", category: "Mains", price: 260, veg: false, description: "" },
  { name: "Margherita Pizza", category: "Mains", price: 320, veg: true, description: "Wood-fired, 10 inch" },
  { name: "French Fries", category: "Snacks", price: 130, veg: true, description: "" },
  { name: "Chicken Momos", category: "Snacks", price: 190, veg: false, description: "Steamed, 6 pcs" },
  { name: "Nutella Brownie", category: "Desserts", price: 170, veg: true, description: "" },
  { name: "Gulab Jamun Cheesecake", category: "Desserts", price: 190, veg: true, description: "House special" },
];

const tables = [
  { tableNumber: 1, capacity: 2, location: "Main Floor" },
  { tableNumber: 2, capacity: 2, location: "Main Floor" },
  { tableNumber: 3, capacity: 4, location: "Main Floor" },
  { tableNumber: 4, capacity: 4, location: "Main Floor" },
  { tableNumber: 5, capacity: 6, location: "Main Floor" },
  { tableNumber: 6, capacity: 2, location: "Patio" },
  { tableNumber: 7, capacity: 4, location: "Patio" },
  { tableNumber: 8, capacity: 8, location: "Private Room" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected — seeding...");

  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  await MenuItem.insertMany(menuItems);
  await Table.insertMany(tables);

  console.log(`Seeded ${menuItems.length} menu items and ${tables.length} tables.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
