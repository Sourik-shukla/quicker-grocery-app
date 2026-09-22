import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.get("/stats", auth, allow("manager", "admin"), async (_, res) => {
  const [products, orders, users, revenue] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }])
  ]);
  res.json({ products, orders, users, revenue: revenue[0]?.total || 0 });
});

export default router;
