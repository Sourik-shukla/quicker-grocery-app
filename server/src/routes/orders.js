import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay test keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

async function validateCart(items) {
  if (!Array.isArray(items) || !items.length) throw new Error("Your cart is empty");

  const cleanItems = items.map(i => ({
    product: i.product,
    quantity: Number(i.quantity)
  }));

  if (cleanItems.some(i => !i.product || !Number.isInteger(i.quantity) || i.quantity < 1)) {
    throw new Error("Invalid cart items");
  }

  const ids = cleanItems.map(i => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map(p => [String(p._id), p]));

  let total = 0;
  const orderItems = [];
  for (const item of cleanItems) {
    const p = map.get(String(item.product));
    if (!p) throw new Error("Product not found");
    if (p.stock < item.quantity) throw new Error(`${p.name} has only ${p.stock} left`);
    total += p.price * item.quantity;
    orderItems.push({
      product: p._id,
      name: p.name,
      quantity: item.quantity,
      price: p.price,
      image: p.image
    });
  }
  const delivery = total > 499 ? 0 : 30;
  return { subtotal: total, delivery, total: total + delivery, orderItems };
}

async function reduceStock(orderItems) {
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, salesCount: item.quantity } },
      { new: true }
    );
    if (!updated) throw new Error(`${item.name} is no longer available in the requested quantity`);
  }
}

router.post("/", auth, async (req, res) => {
  try {
    const { items, address, contactPhone, paymentMethod = "COD" } = req.body;
    if (!address?.trim() || !contactPhone?.trim()) {
      return res.status(400).json({ message: "Delivery address and phone number are required" });
    }
    if (paymentMethod !== "COD") {
      return res.status(400).json({ message: "Online payments must be completed through the payment checkout" });
    }

    const { total, orderItems } = await validateCart(items);
    await reduceStock(orderItems);

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      total,
      address: address.trim(),
      contactPhone: contactPhone.trim(),
      paymentMethod: "COD",
      paymentStatus: "pending"
    });

    res.status(201).json(await order.populate("customer", "name email"));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/payment/create", auth, async (req, res) => {
  try {
    const { items, address, contactPhone } = req.body;
    if (!address?.trim() || !contactPhone?.trim()) {
      return res.status(400).json({ message: "Delivery address and phone number are required" });
    }

    const { total, orderItems } = await validateCart(items);
    const razorpay = getRazorpay();
    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `quick_${Date.now()}`,
      notes: { customerId: String(req.user.id) }
    });

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      total,
      items: orderItems
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/payment/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      contactPhone
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details are incomplete" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const { total, orderItems } = await validateCart(items);
    await reduceStock(orderItems);

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      total,
      address: address.trim(),
      contactPhone: contactPhone.trim(),
      paymentMethod: "RAZORPAY",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    res.status(201).json(await order.populate("customer", "name email"));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/my", auth, async (req, res) => {
  res.json(await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }).populate("rider", "name"));
});

router.get("/", auth, allow("manager", "admin", "rider"), async (req, res) => {
  const filter = req.user.role === "rider" ? { rider: req.user.id } : {};
  res.json(await Order.find(filter).sort({ createdAt: -1 }).populate("customer", "name email").populate("rider", "name"));
});

router.patch("/:id/status", auth, allow("manager", "admin", "rider"), async (req, res) => {
  const allowed = ["confirmed", "packing", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });

  const update = { status: req.body.status };
  if (req.user.role === "rider" && req.body.status === "out_for_delivery") update.rider = req.user.id;

  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate("customer", "name email").populate("rider", "name");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

export default router;
