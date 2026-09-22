import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany([
  {"name": "Tomatoes", "category": "Vegetables", "price": 30, "stock": 50, "image": "/products/tomatoes.svg", "description": "Fresh red tomatoes • 1 kg"},
  {"name": "Potatoes", "category": "Vegetables", "price": 25, "stock": 60, "image": "/products/potatoes.svg", "description": "Farm fresh potatoes • 1 kg"},
  {"name": "Onions", "category": "Vegetables", "price": 28, "stock": 55, "image": "/products/onions.svg", "description": "Fresh onions • 1 kg"},
  {"name": "Carrots", "category": "Vegetables", "price": 40, "stock": 45, "image": "/products/carrots.svg", "description": "Crunchy fresh carrots • 1 kg"},
  {"name": "Capsicum", "category": "Vegetables", "price": 60, "stock": 35, "image": "/products/capsicum.svg", "description": "Fresh green capsicum • 1 kg"},
  {"name": "Bananas", "category": "Fruits", "price": 50, "stock": 40, "image": "/products/bananas.svg", "description": "Fresh ripe bananas • 1 kg"},
  {"name": "Apples", "category": "Fruits", "price": 120, "stock": 30, "image": "/products/apples.svg", "description": "Crisp red apples • 1 kg"},
  {"name": "Oranges", "category": "Fruits", "price": 90, "stock": 35, "image": "/products/oranges.svg", "description": "Juicy fresh oranges • 1 kg"},
  {"name": "Fresh Milk", "category": "Dairy", "price": 60, "stock": 40, "image": "/products/milk.svg", "description": "Daily fresh milk • 1 L"},
  {"name": "Curd", "category": "Dairy", "price": 42, "stock": 25, "image": "/products/curd.svg", "description": "Fresh creamy curd • 400 g"},
  {"name": "Eggs", "category": "Dairy", "price": 70, "stock": 35, "image": "/products/eggs.svg", "description": "Farm fresh eggs • 12 pcs"},
  {"name": "Paneer", "category": "Dairy", "price": 95, "stock": 25, "image": "/products/paneer.svg", "description": "Soft fresh paneer • 200 g"},
  {"name": "Rice", "category": "Grains & Pulses", "price": 80, "stock": 50, "image": "/products/rice.svg", "description": "Premium rice • 1 kg"},
  {"name": "Moong Dal", "category": "Grains & Pulses", "price": 110, "stock": 35, "image": "/products/moong-dal.svg", "description": "High quality moong dal • 1 kg"},
  {"name": "Toor Dal", "category": "Grains & Pulses", "price": 100, "stock": 35, "image": "/products/toor-dal.svg", "description": "Premium toor dal • 1 kg"},
  {"name": "Wheat Flour (Atta)", "category": "Grains & Pulses", "price": 45, "stock": 50, "image": "/products/atta.svg", "description": "Fresh wheat flour • 1 kg"},
  {"name": "Cooking Oil", "category": "Staples", "price": 150, "stock": 30, "image": "/products/oil.svg", "description": "Refined cooking oil • 1 L"},
  {"name": "Brown Bread", "category": "Bakery", "price": 45, "stock": 25, "image": "/products/bread.svg", "description": "Soft whole-wheat bread • 400 g"},
  {"name": "Masala Maggi", "category": "Snacks", "price": 20, "stock": 60, "image": "/products/maggi.svg", "description": "Instant spicy noodles • 70 g"},
  {"name": "Potato Chips", "category": "Snacks", "price": 30, "stock": 45, "image": "/products/chips.svg", "description": "Crispy salted chips • 100 g"},
  {"name": "Biscuits", "category": "Snacks", "price": 30, "stock": 50, "image": "/products/biscuits.svg", "description": "Crunchy tea-time biscuits • 120 g"},
  {"name": "Orange Juice", "category": "Beverages", "price": 90, "stock": 30, "image": "/products/orange-juice.svg", "description": "Refreshing fruit juice • 1 L"},
  {"name": "Mineral Water", "category": "Beverages", "price": 20, "stock": 100, "image": "/products/water.svg", "description": "Purified drinking water • 1 L"},
  {"name": "Tea", "category": "Beverages", "price": 140, "stock": 25, "image": "/products/tea.svg", "description": "Premium tea leaves • 500 g"},
  {"name": "Dishwash Liquid", "category": "Household", "price": 110, "stock": 20, "image": "/products/dishwash.svg", "description": "Powerful dish cleaning liquid • 500 ml"},
  {"name": "Laundry Detergent", "category": "Household", "price": 180, "stock": 20, "image": "/products/detergent.svg", "description": "Fresh fragrance detergent • 1 kg"},
  {"name": "Sugar", "category": "Grains & Pulses", "price": 48, "stock": 40, "image": "/products/sugar.svg", "description": "Fine white sugar • 1 kg"},
  {"name": "Salt", "category": "Grains & Pulses", "price": 25, "stock": 60, "image": "/products/salt.svg", "description": "Iodized table salt • 1 kg"},
  {"name": "Coffee", "category": "Beverages", "price": 160, "stock": 25, "image": "/products/coffee.svg", "description": "Instant coffee • 100 g"},
  {"name": "Poha", "category": "Grains & Pulses", "price": 55, "stock": 35, "image": "/products/poha.svg", "description": "Thin rice flakes • 1 kg"},
  {"name": "White Bread", "category": "Bakery", "price": 40, "stock": 25, "image": "/products/bread-white.svg", "description": "Soft sandwich bread • 400 g"},
  {"name": "Bath Soap", "category": "Household", "price": 45, "stock": 40, "image": "/products/soap.svg", "description": "Gentle bathing soap • 100 g"},
  {"name": "Toothpaste", "category": "Household", "price": 85, "stock": 30, "image": "/products/toothpaste.svg", "description": "Fresh mint toothpaste • 150 g"},
]);
console.log("Seed complete: grocery products loaded");
await mongoose.disconnect();
