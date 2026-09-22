import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    quantity: { type: Number, min: 1 },
    price: { type: Number, min: 0 },
    image: String
  }],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  contactPhone: { type: String, required: true },
  paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  status: {
    type: String,
    enum: ["placed", "confirmed", "packing", "out_for_delivery", "delivered", "cancelled"],
    default: "placed"
  },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
