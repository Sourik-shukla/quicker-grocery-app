import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  description: { type: String, default: "" },
  expiryDate: Date,
  salesCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
